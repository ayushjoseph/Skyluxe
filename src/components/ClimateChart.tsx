import { ClimateMetrics } from '../types/climate';

interface ClimateChartProps {
  data: ClimateMetrics[];
  title: string;
}

export function ClimateChart({ data, title }: ClimateChartProps) {
  const maxTemp = Math.max(...data.map(d => d.temperature.max));
  const minTemp = Math.min(...data.map(d => d.temperature.min));
  const tempRange = maxTemp - minTemp;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((metric, index) => {
          const meanPercent = ((metric.temperature.mean - minTemp) / tempRange) * 100;
          const maxPercent = ((metric.temperature.max - minTemp) / tempRange) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {new Date(metric.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-gray-600">
                  {metric.temperature.mean.toFixed(1)}°C
                </span>
              </div>

              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-400 to-red-400 rounded-full transition-all"
                  style={{
                    width: `${maxPercent}%`,
                    left: 0
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full"
                  style={{ left: `${meanPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{metric.temperature.min.toFixed(1)}°C</span>
                <span>{metric.temperature.max.toFixed(1)}°C</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-gray-800 rounded-full" />
            <span className="text-gray-600">Mean Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-gradient-to-r from-blue-400 to-red-400 rounded" />
            <span className="text-gray-600">Min-Max Range</span>
          </div>
        </div>
      </div>
    </div>
  );
}
