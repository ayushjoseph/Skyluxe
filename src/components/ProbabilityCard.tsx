import { AlertTriangle, Thermometer, Snowflake, CloudRain, Wind, Droplets } from 'lucide-react';

interface ProbabilityCardProps {
  type: 'extremeHeat' | 'extremeCold' | 'heavyRain' | 'highWind' | 'uncomfortable';
  probability: number;
}

export function ProbabilityCard({ type, probability }: ProbabilityCardProps) {
  const configs = {
    extremeHeat: {
      title: 'Extreme Heat',
      subtitle: 'Days >32°C (90°F)',
      icon: Thermometer,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      barColor: 'bg-red-500',
    },
    extremeCold: {
      title: 'Extreme Cold',
      subtitle: 'Days <0°C (32°F)',
      icon: Snowflake,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      barColor: 'bg-blue-500',
    },
    heavyRain: {
      title: 'Heavy Rain',
      subtitle: 'Days >25mm precipitation',
      icon: CloudRain,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      barColor: 'bg-indigo-500',
    },
    highWind: {
      title: 'High Wind',
      subtitle: 'Days >40 km/h wind',
      icon: Wind,
      color: 'slate',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      barColor: 'bg-slate-500',
    },
    uncomfortable: {
      title: 'Uncomfortable',
      subtitle: 'Days >80% humidity',
      icon: Droplets,
      color: 'teal',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      barColor: 'bg-teal-500',
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const severity = probability > 30 ? 'high' : probability > 10 ? 'medium' : 'low';

  return (
    <div className={`${config.bgColor} rounded-lg p-5 border border-${config.color}-200`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${config.textColor}`} />
            <h4 className={`font-semibold ${config.textColor}`}>{config.title}</h4>
          </div>
          <p className="text-xs text-gray-600">{config.subtitle}</p>
        </div>
        {severity === 'high' && (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${config.textColor}`}>{probability}</span>
          <span className={`text-lg ${config.textColor}`}>%</span>
        </div>
      </div>

      <div className="relative h-2 bg-white rounded-full overflow-hidden">
        <div
          className={`absolute h-full ${config.barColor} rounded-full transition-all duration-500`}
          style={{ width: `${probability}%` }}
        />
      </div>

      <p className="text-xs text-gray-600 mt-2">
        {probability === 0 && 'Very unlikely to occur'}
        {probability > 0 && probability <= 10 && 'Low probability'}
        {probability > 10 && probability <= 30 && 'Moderate probability'}
        {probability > 30 && probability <= 60 && 'High probability'}
        {probability > 60 && 'Very high probability'}
      </p>
    </div>
  );
}
