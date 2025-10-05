import { LocationData } from '../types/climate';

export class GeocodingService {
  async geocodeLocation(locationName: string): Promise<LocationData> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error('Location not found');
      }

      const result = data[0];

      return {
        name: result.display_name.split(',')[0],
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        country: result.display_name.split(',').slice(-1)[0].trim(),
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      return {
        name: data.address.city || data.address.town || data.address.village || 'Unknown',
        latitude,
        longitude,
        country: data.address.country,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }
}

export const geocodingService = new GeocodingService();
