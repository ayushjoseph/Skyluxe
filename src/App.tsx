import { useState } from 'react';
import { Thermometer, Droplets, Wind, CloudRain, Activity, Satellite, Calendar } from 'lucide-react';
import { ClimateAnalysisResponse } from './types/climate';
import { nasaPowerApi } from './services/nasaPowerApi';
import { geocodingService } from './services/geocoding';
import { MetricCard } from './components/MetricCard';
import { ClimateChart } from './components/ClimateChart';
import { LocationSearch } from './components/LocationSearch';
import { ProbabilityCard } from './components/ProbabilityCard';
import { ExportPanel } from './components/ExportPanel';

function App() {
  const [climateData, setClimateData] = useState<ClimateAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const handleSearch = async (location: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const locationData = await geocodingService.geocodeLocation(location);

      const currentDate = new Date();
      const endDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      const startDate = new Date(endDate.getFullYear() - 9, endDate.getMonth(), endDate.getDate());

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      setDateRange({ start, end });

      const data = await nasaPowerApi.getClimateData(
        locationData.latitude,
        locationData.longitude,
        start,
        end,
        locationData.name
      );

      setClimateData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch climate data');
      console.error('Error fetching climate data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMetrics = climateData?.metrics[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Satellite className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">NASA Climate Analyzer</h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Historical weather probability analysis powered by NASA POWER data
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-4 py-2 inline-flex">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Using NASA POWER API - 40+ years of global satellite data</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <LocationSearch onSearch={handleSearch} isLoading={isLoading} />

            {dateRange && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Data Range</h4>
                </div>
                <p className="text-xs text-gray-600">
                  {dateRange.start} to {dateRange.end}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  10 years of historical data
                </p>
              </div>
            )}
          </div>

          {climateData && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {climateData.location.name}
                    </h2>
                    <p className="text-gray-600">
                      {climateData.location.latitude.toFixed(4)}°, {climateData.location.longitude.toFixed(4)}°
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Data Points</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {climateData.summary.dataPoints.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Avg Temp</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {climateData.summary.avgTemperature.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Precip</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {climateData.summary.totalPrecipitation.toFixed(0)} mm
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Humidity</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {climateData.summary.avgHumidity.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-medium">Error: {error}</p>
            <p className="text-red-600 text-sm mt-1">Please try a different location or check your connection.</p>
          </div>
        )}

        {currentMetrics && climateData && (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Conditions</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Mean Temperature"
                  value={currentMetrics.temperature.mean}
                  unit="°C"
                  icon={Thermometer}
                  trend="neutral"
                  subtitle={`Range: ${currentMetrics.temperature.min.toFixed(1)}°C - ${currentMetrics.temperature.max.toFixed(1)}°C`}
                />
                <MetricCard
                  title="Precipitation"
                  value={currentMetrics.precipitation.amount}
                  unit="mm"
                  icon={Droplets}
                  trend="neutral"
                  subtitle="Daily total"
                />
                <MetricCard
                  title="Humidity"
                  value={currentMetrics.humidity || 0}
                  unit="%"
                  icon={CloudRain}
                  trend="neutral"
                  subtitle="Relative humidity"
                />
                <MetricCard
                  title="Wind Speed"
                  value={(currentMetrics.windSpeed || 0) * 3.6}
                  unit="km/h"
                  icon={Wind}
                  trend="neutral"
                  subtitle="At 10m height"
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Weather Probabilities</h3>
              <p className="text-gray-600 mb-6">
                Likelihood of extreme weather conditions based on {climateData.summary.dataPoints.toLocaleString()} days of historical NASA data
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <ProbabilityCard type="extremeHeat" probability={climateData.probabilities.extremeHeat} />
                <ProbabilityCard type="extremeCold" probability={climateData.probabilities.extremeCold} />
                <ProbabilityCard type="heavyRain" probability={climateData.probabilities.heavyRain} />
                <ProbabilityCard type="highWind" probability={climateData.probabilities.highWind} />
                <ProbabilityCard type="uncomfortable" probability={climateData.probabilities.uncomfortable} />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <ClimateChart
                  data={climateData.metrics.slice(0, 30)}
                  title="Temperature Analysis (Last 30 Days of Dataset)"
                />
              </div>

              <div className="lg:col-span-1">
                {dateRange && <ExportPanel data={climateData} dateRange={dateRange} />}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">About This Data</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Data Source:</strong> NASA POWER (Prediction Of Worldwide Energy Resources)
                </p>
                <p>
                  <strong>Coverage:</strong> Global satellite and model-derived meteorological data
                </p>
                <p>
                  <strong>Variables:</strong> Temperature (T2M), Precipitation (PRECTOTCORR), Humidity (RH2M), Wind Speed (WS10M), Pressure (PS)
                </p>
                <p>
                  <strong>Link:</strong>{' '}
                  <a
                    href="https://power.larc.nasa.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://power.larc.nasa.gov
                  </a>
                </p>
              </div>
            </div>
          </>
        )}

        {!climateData && !isLoading && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Satellite className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Analyze Climate Probabilities
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Search for any location worldwide to view historical weather patterns and understand
              the probability of extreme conditions. Perfect for planning outdoor activities,
              vacations, or understanding climate trends over time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
