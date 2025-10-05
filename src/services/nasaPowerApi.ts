import { NASAPowerResponse, ClimateAnalysisResponse, ClimateMetrics, WeatherProbabilities } from '../types/climate';
import { toFiniteNumber, safeText } from '../utils/sanitize';

const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

export class NASAPowerService {
  private calculateProbabilities(metrics: ClimateMetrics[]): WeatherProbabilities {
    const temps = metrics.map(m => toFiniteNumber(m.temperature.mean, 0, { min: -100, max: 60 }));
    const precips = metrics.map(m => toFiniteNumber(m.precipitation.amount, 0, { min: 0, max: 500 }));
    const winds = metrics.map(m => toFiniteNumber(m.windSpeed ?? 0, 0, { min: 0, max: 150 }));
    const humidities = metrics.map(m => toFiniteNumber(m.humidity ?? 0, 0, { min: 0, max: 100 }));

    const extremeHeatThreshold = 32;
    const extremeColdThreshold = 0;
    const heavyRainThreshold = 25;
    const highWindThreshold = 40;
    const uncomfortableHumidityThreshold = 80;

    const denomT = temps.length || 1;
    const denomP = precips.length || 1;
    const denomW = winds.length || 1;
    const denomH = humidities.length || 1;

    const extremeHeat = (temps.filter(t => t > extremeHeatThreshold).length / denomT) * 100;
    const extremeCold = (temps.filter(t => t < extremeColdThreshold).length / denomT) * 100;
    const heavyRain = (precips.filter(p => p > heavyRainThreshold).length / denomP) * 100;
    const highWind = (winds.filter(w => w > highWindThreshold).length / denomW) * 100;
    const uncomfortable = (humidities.filter(h => h > uncomfortableHumidityThreshold).length / denomH) * 100;

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

    const formattedStartDate = safeText(startDate, 10).replace(/-/g, '');
    const formattedEndDate = safeText(endDate, 10).replace(/-/g, '');

    const url = `${NASA_POWER_BASE_URL}?parameters=${parameters}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${formattedStartDate}&end=${formattedEndDate}&format=JSON`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`);
      }

      const data: NASAPowerResponse = await response.json();

      if (!data || !data.properties || !data.properties.parameter) {
        throw new Error('NASA POWER API returned unexpected data');
      }

      const metrics = this.transformNASAData(data, locationName);

      const temps = metrics.map(m => toFiniteNumber(m.temperature.mean, 0, { min: -100, max: 60 }));
      const maxTemps = metrics.map(m => toFiniteNumber(m.temperature.max, 0, { min: -100, max: 60 }));
      const minTemps = metrics.map(m => toFiniteNumber(m.temperature.min, 0, { min: -100, max: 60 }));
      const precips = metrics.map(m => toFiniteNumber(m.precipitation.amount, 0, { min: 0, max: 500 }));
      const humidities = metrics.map(m => toFiniteNumber(m.humidity ?? 0, 0, { min: 0, max: 100 }));

      const safeLenT = temps.length || 1;
      const safeLenH = humidities.length || 1;
      const summary = {
        avgTemperature: temps.reduce((sum, t) => sum + t, 0) / safeLenT,
        maxTemperature: maxTemps.length ? Math.max(...maxTemps) : 0,
        minTemperature: minTemps.length ? Math.min(...minTemps) : 0,
        totalPrecipitation: precips.reduce((sum, p) => sum + p, 0),
        avgHumidity: humidities.reduce((sum, h) => sum + h, 0) / safeLenH,
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
        location: safeText(locationName, 80) || 'Unknown',
        date: formattedDate,
        temperature: {
          mean: toFiniteNumber(params.T2M?.[date], 0, { min: -100, max: 60 }),
          max: toFiniteNumber(params.T2M_MAX?.[date], 0, { min: -100, max: 60 }),
          min: toFiniteNumber(params.T2M_MIN?.[date], 0, { min: -100, max: 60 }),
          unit: 'celsius' as const,
        },
        precipitation: {
          amount: toFiniteNumber(params.PRECTOTCORR?.[date], 0, { min: 0, max: 500 }),
          unit: 'mm' as const,
        },
        humidity: toFiniteNumber(params.RH2M?.[date], undefined as unknown as number, { min: 0, max: 100 }),
        windSpeed: toFiniteNumber(params.WS10M?.[date], undefined as unknown as number, { min: 0, max: 150 }),
        pressure: toFiniteNumber(params.PS?.[date], undefined as unknown as number, { min: 0, max: 200 }),
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
