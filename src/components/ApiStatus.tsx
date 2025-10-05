import { AlertCircle, CheckCircle, Cloud } from 'lucide-react';

interface ApiStatusProps {
  isConnected: boolean;
  apiUrl: string;
}

export function ApiStatus({ isConnected, apiUrl }: ApiStatusProps) {
  return (
    <div className={`rounded-lg p-4 ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div className="flex items-start gap-3">
        {isConnected ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className={`font-medium ${isConnected ? 'text-green-900' : 'text-amber-900'}`}>
            {isConnected ? 'Connected to API' : 'Using Mock Data'}
          </h4>
          <p className={`text-sm mt-1 ${isConnected ? 'text-green-700' : 'text-amber-700'}`}>
            {isConnected ? (
              <>API endpoint: <code className="bg-green-100 px-1 rounded">{apiUrl}</code></>
            ) : (
              <>
                Backend not detected at <code className="bg-amber-100 px-1 rounded">{apiUrl}</code>.
                Start your FastAPI server to see live data.
              </>
            )}
          </p>
        </div>
        <Cloud className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-amber-600'} flex-shrink-0`} />
      </div>
    </div>
  );
}
