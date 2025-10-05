import { ClimateAnalysisResponse, ClimateMetrics } from '../types/climate';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ClimateApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getClimateData(location: string, startDate?: string, endDate?: string): Promise<ClimateAnalysisResponse> {
    try {
      const params = new URLSearchParams();
      params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${this.baseUrl}/api/climate?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch climate data:', error);
      return this.getMockData(location);
    }
  }

  async getTemperatureAnalysis(location: string): Promise<ClimateMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/temperature/${location}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch temperature data:', error);
      return this.getMockMetrics(location);
    }
  }

  private getMockData(location: string): ClimateAnalysisResponse {
    const mockMetrics: ClimateMetrics[] = Array.from({ length: 7 }, (_, i) => ({
      location,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: {
        mean: 20 + Math.random() * 10,
        max: 25 + Math.random() * 5,
        min: 15 + Math.random() * 5,
        unit: 'celsius' as const,
      },
      precipitation: {
        amount: Math.random() * 20,
        unit: 'mm' as const,
      },
      humidity: 60 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 15,
    }));

    return {
      location: {
        name: location,
        latitude: 40.7128,
        longitude: -74.0060,
        country: 'Mock Data',
      },
      metrics: mockMetrics,
      summary: {
        avgTemperature: mockMetrics.reduce((sum, m) => sum + m.temperature.mean, 0) / mockMetrics.length,
        totalPrecipitation: mockMetrics.reduce((sum, m) => sum + m.precipitation.amount, 0),
        dataPoints: mockMetrics.length,
      },
    };
  }

  private getMockMetrics(location: string): ClimateMetrics {
    return {
      location,
      date: new Date().toISOString().split('T')[0],
      temperature: {
        mean: 22,
        max: 28,
        min: 16,
        unit: 'celsius',
      },
      precipitation: {
        amount: 5.2,
        unit: 'mm',
      },
      humidity: 65,
      windSpeed: 12,
    };
  }
}

export const climateApi = new ClimateApiService();
