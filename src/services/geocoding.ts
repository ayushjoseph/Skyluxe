import { LocationData } from '../types/climate';
import { safeText, toFiniteNumber } from '../utils/sanitize';

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

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Location not found');
      }

      const result = data[0];
      const rawName: string = (result.display_name || '').split(',')[0] || '';
      const rawCountry: string = ((result.display_name || '').split(',').slice(-1)[0] || '').trim();

      const latitude = toFiniteNumber(result.lat, 0, { min: -90, max: 90 });
      const longitude = toFiniteNumber(result.lon, 0, { min: -180, max: 180 });

      return {
        name: safeText(rawName, 80) || 'Unknown',
        latitude,
        longitude,
        country: safeText(rawCountry, 56) || undefined,
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
      const address = data?.address || {};
      const nameCandidate = address.city || address.town || address.village || address.hamlet || 'Unknown';

      const lat = toFiniteNumber(latitude, 0, { min: -90, max: 90 });
      const lon = toFiniteNumber(longitude, 0, { min: -180, max: 180 });

      return {
        name: safeText(nameCandidate, 80) || 'Unknown',
        latitude: lat,
        longitude: lon,
        country: safeText(address.country, 56) || undefined,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }
}

export const geocodingService = new GeocodingService();
