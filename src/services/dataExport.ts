import { ExportData, ClimateAnalysisResponse } from '../types/climate';

export class DataExportService {
  exportToJSON(data: ClimateAnalysisResponse, dateRange: { start: string; end: string }): void {
    const exportData: ExportData = {
      metadata: {
        location: data.location,
        dateRange,
        dataSource: 'NASA POWER API (https://power.larc.nasa.gov)',
        exportedAt: new Date().toISOString(),
      },
      data: data.metrics,
      summary: data.summary,
      probabilities: data.probabilities,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonString, `climate-data-${data.location.name}-${Date.now()}.json`, 'application/json');
  }

  exportToCSV(data: ClimateAnalysisResponse, dateRange: { start: string; end: string }): void {
    const headers = [
      'Date',
      'Location',
      'Latitude',
      'Longitude',
      'Mean Temperature (°C)',
      'Max Temperature (°C)',
      'Min Temperature (°C)',
      'Precipitation (mm)',
      'Humidity (%)',
      'Wind Speed (m/s)',
      'Pressure (kPa)'
    ];

    const rows = data.metrics.map(metric => [
      metric.date,
      data.location.name,
      data.location.latitude.toFixed(4),
      data.location.longitude.toFixed(4),
      metric.temperature.mean.toFixed(2),
      metric.temperature.max.toFixed(2),
      metric.temperature.min.toFixed(2),
      metric.precipitation.amount.toFixed(2),
      (metric.humidity || 0).toFixed(2),
      (metric.windSpeed || 0).toFixed(2),
      (metric.pressure || 0).toFixed(2)
    ]);

    const metadataRows = [
      ['# Climate Data Export'],
      ['# Data Source: NASA POWER API (https://power.larc.nasa.gov)'],
      [`# Location: ${data.location.name}`],
      [`# Coordinates: ${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`],
      [`# Date Range: ${dateRange.start} to ${dateRange.end}`],
      [`# Exported: ${new Date().toISOString()}`],
      [''],
      ['# Summary Statistics'],
      [`# Average Temperature: ${data.summary.avgTemperature.toFixed(2)}°C`],
      [`# Max Temperature: ${data.summary.maxTemperature.toFixed(2)}°C`],
      [`# Min Temperature: ${data.summary.minTemperature.toFixed(2)}°C`],
      [`# Total Precipitation: ${data.summary.totalPrecipitation.toFixed(2)} mm`],
      [`# Average Humidity: ${data.summary.avgHumidity.toFixed(2)}%`],
      [`# Data Points: ${data.summary.dataPoints}`],
      [''],
      ['# Weather Probabilities (%)'],
      [`# Extreme Heat (>32°C): ${data.probabilities.extremeHeat}%`],
      [`# Extreme Cold (<0°C): ${data.probabilities.extremeCold}%`],
      [`# Heavy Rain (>25mm): ${data.probabilities.heavyRain}%`],
      [`# High Wind (>40 m/s): ${data.probabilities.highWind}%`],
      [`# Uncomfortable Humidity (>80%): ${data.probabilities.uncomfortable}%`],
      [''],
    ];

    const csvContent = [
      ...metadataRows.map(row => row.join(',')),
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, `climate-data-${data.location.name}-${Date.now()}.csv`, 'text/csv');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const dataExportService = new DataExportService();
