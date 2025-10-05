import { Search, MapPin } from 'lucide-react';
import { useState } from 'react';
import { validateLocationName } from '../utils/validation';

interface LocationSearchProps {
  onSearch: (location: string) => void;
  isLoading?: boolean;
}

export function LocationSearch({ onSearch, isLoading }: LocationSearchProps) {
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateLocationName(location);
    if (!result.ok) {
      setError(result.error || 'Invalid location');
      return;
    }
    setError(null);
    onSearch(result.value!);
  };

  const popularLocations = ['New York', 'London', 'Tokyo', 'Sydney'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Search Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => {
                const val = e.target.value;
                setLocation(val);
                const v = validateLocationName(val);
                setError(v.ok || val.trim() === '' ? null : v.error || 'Invalid location');
              }}
              placeholder="Enter city name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !location.trim() || !!error}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {isLoading ? 'Analyzing...' : 'Analyze Climate'}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Popular Locations:</p>
        <div className="flex flex-wrap gap-2">
          {popularLocations.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocation(loc);
                setError(null);
                onSearch(loc);
              }}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
