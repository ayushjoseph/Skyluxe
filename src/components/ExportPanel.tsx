import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { ClimateAnalysisResponse } from '../types/climate';
import { dataExportService } from '../services/dataExport';

interface ExportPanelProps {
  data: ClimateAnalysisResponse;
  dateRange: { start: string; end: string };
}

export function ExportPanel({ data, dateRange }: ExportPanelProps) {
  const handleExportJSON = () => {
    dataExportService.exportToJSON(data, dateRange);
  };

  const handleExportCSV = () => {
    dataExportService.exportToCSV(data, dateRange);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Download climate data with metadata, summary statistics, and probability analysis
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all group"
        >
          <FileJson className="w-6 h-6 text-slate-600 group-hover:text-slate-700" />
          <div className="text-left">
            <div className="font-semibold text-slate-900">JSON</div>
            <div className="text-xs text-slate-600">Structured data format</div>
          </div>
        </button>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all group"
        >
          <FileSpreadsheet className="w-6 h-6 text-green-600 group-hover:text-green-700" />
          <div className="text-left">
            <div className="font-semibold text-green-900">CSV</div>
            <div className="text-xs text-green-600">Spreadsheet compatible</div>
          </div>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Data source: NASA POWER API • Includes metadata with units and source links
        </p>
      </div>
    </div>
  );
}
