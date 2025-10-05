import { NASAPowerResponse, ClimateAnalysisResponse, ClimateMetrics, WeatherProbabilities } from '../types/climate';

const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

export class NASAPowerService {
  private calculateProbabilities(metrics: ClimateMetrics[]): WeatherProbabilities {
    const temps = metrics.map(m => m.temperature.mean);
    const precips = metrics.map(m => m.precipitation.amount);
    const winds = metrics.map(m => m.windSpeed || 0);
    const humidities = metrics.map(m => m.humidity || 0);

    const extremeHeatThreshold = 32;
    const extremeColdThreshold = 0;
    const heavyRainThreshold = 25;
    const highWindThreshold = 40;
    const uncomfortableHumidityThreshold = 80;

    const extremeHeat = (temps.filter(t => t > extremeHeatThreshold).length / temps.length) * 100;
    const extremeCold = (temps.filter(t => t < extremeColdThreshold).length / temps.length) * 100;
    const heavyRain = (precips.filter(p => p > heavyRainThreshold).length / precips.length) * 100;
    const highWind = (winds.filter(w => w > highWindThreshold).length / winds.length) * 100;
    const uncomfortable = (humidities.filter(h => h > uncomfortableHumidityThreshold).length / humidities.length) * 100;

    return {
      extremeHeat: Math.round(extremeHeat),
      extremeCold: Math.round(extremeCold),
      heavyRain: Math.round(heavyRain),
      highWind: Math.round(highWind),
      uncomfortable: Math.round(uncomfortable),
    };
  }

  async getClimateData(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string,
    locationName: string
  ): Promise<ClimateAnalysisResponse> {
    const parameters = [
      'T2M',
      'T2M_MAX',
      'T2M_MIN',
      'PRECTOTCORR',
      'RH2M',
      'WS10M',
      'PS'
    ].join(',');

    const formattedStartDate = startDate.replace(/-/g, '');
    const formattedEndDate = endDate.replace(/-/g, '');

    const url = `${NASA_POWER_BASE_URL}?parameters=${parameters}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${formattedStartDate}&end=${formattedEndDate}&format=JSON`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`);
      }

      const data: NASAPowerResponse = await response.json();

      const metrics = this.transformNASAData(data, locationName);

      const temps = metrics.map(m => m.temperature.mean);
      const maxTemps = metrics.map(m => m.temperature.max);
      const minTemps = metrics.map(m => m.temperature.min);
      const precips = metrics.map(m => m.precipitation.amount);
      const humidities = metrics.map(m => m.humidity || 0);

      const summary = {
        avgTemperature: temps.reduce((sum, t) => sum + t, 0) / temps.length,
        maxTemperature: Math.max(...maxTemps),
        minTemperature: Math.min(...minTemps),
        totalPrecipitation: precips.reduce((sum, p) => sum + p, 0),
        avgHumidity: humidities.reduce((sum, h) => sum + h, 0) / humidities.length,
        dataPoints: metrics.length,
      };

      const probabilities = this.calculateProbabilities(metrics);

      return {
        location: {
          name: locationName,
          latitude,
          longitude,
        },
        metrics,
        summary,
        probabilities,
      };
    } catch (error) {
      console.error('NASA POWER API fetch failed:', error);
      throw error;
    }
  }

  private transformNASAData(data: NASAPowerResponse, locationName: string): ClimateMetrics[] {
    const params = data.properties.parameter;
    const dates = Object.keys(params.T2M || {});

    return dates.map(date => {
      const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

      return {
        location: locationName,
        date: formattedDate,
        temperature: {
          mean: params.T2M?.[date] || 0,
          max: params.T2M_MAX?.[date] || 0,
          min: params.T2M_MIN?.[date] || 0,
          unit: 'celsius' as const,
        },
        precipitation: {
          amount: params.PRECTOTCORR?.[date] || 0,
          unit: 'mm' as const,
        },
        humidity: params.RH2M?.[date],
        windSpeed: params.WS10M?.[date],
        pressure: params.PS?.[date],
      };
    });
  }

  getHistoricalDateRange(monthDay: string): { start: string; end: string } {
    const currentYear = new Date().getFullYear();
    const yearsOfData = 10;
    const startYear = currentYear - yearsOfData;

    const [month, day] = monthDay.split('-');
    const start = `${startYear}-${month}-${day}`;
    const end = `${currentYear - 1}-${month}-${day}`;

    return { start, end };
  }
}

export const nasaPowerApi = new NASAPowerService();
