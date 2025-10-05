export interface TemperatureData {
  mean: number;
  max: number;
  min: number;
  unit: 'celsius' | 'fahrenheit';
}

export interface PrecipitationData {
  amount: number;
  unit: 'mm' | 'inches';
}

export interface ClimateMetrics {
  location: string;
  date: string;
  temperature: TemperatureData;
  precipitation: PrecipitationData;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
}

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface ClimateAnalysisResponse {
  location: LocationData;
  metrics: ClimateMetrics[];
  summary: {
    avgTemperature: number;
    maxTemperature: number;
    minTemperature: number;
    totalPrecipitation: number;
    avgHumidity: number;
    dataPoints: number;
  };
  probabilities: WeatherProbabilities;
}

export interface WeatherProbabilities {
  extremeHeat: number;
  extremeCold: number;
  heavyRain: number;
  highWind: number;
  uncomfortable: number;
}

export interface NASAPowerResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    parameter: {
      [key: string]: {
        [date: string]: number;
      };
    };
  };
  messages?: string[];
  header: {
    title: string;
    api_version: string;
    sources: string[];
  };
}

export interface ExportData {
  metadata: {
    location: LocationData;
    dateRange: { start: string; end: string };
    dataSource: string;
    exportedAt: string;
  };
  data: ClimateMetrics[];
  summary: ClimateAnalysisResponse['summary'];
  probabilities: WeatherProbabilities;
}
