import { CUSCO_DEMO_LOCATIONS } from '../lib/geo';

const STORAGE_KEY_LOCATION = 'platematch_selected_location';
const STORAGE_KEY_RADIUS = 'platematch_geofence_radius';

export const locationService = {
  getDefaultLocation() {
    return CUSCO_DEMO_LOCATIONS[0]; // Campus UAC Larapa
  },

  getCurrentSavedLocation() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading saved location:', e);
    }
    return this.getDefaultLocation();
  },

  saveSelectedLocation(location) {
    try {
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location));
      window.dispatchEvent(new CustomEvent('platematch_location_changed', { detail: location }));
    } catch (e) {
      console.warn('Error saving location:', e);
    }
  },

  getGeofenceRadius() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RADIUS);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val >= 300 && val <= 1000) return val;
      }
    } catch (e) {
      console.warn('Error reading radius:', e);
    }
    return 500; // default 500m geofence
  },

  saveGeofenceRadius(radius) {
    try {
      localStorage.setItem(STORAGE_KEY_RADIUS, String(radius));
      window.dispatchEvent(new CustomEvent('platematch_radius_changed', { detail: radius }));
    } catch (e) {
      console.warn('Error saving radius:', e);
    }
  },

  /**
   * Requests real browser geolocation with user permission
   * Returns promise resolving to { latitude, longitude, isRealGps: true } or rejects
   */
  async requestBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por el navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            id: 'real_gps',
            name: 'Mi Ubicación Actual (GPS)',
            description: 'Ubicación detectada por dispositivo',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            isRealGps: true,
          };
          this.saveSelectedLocation(loc);
          resolve(loc);
        },
        (error) => {
          let message = 'Permiso de ubicación denegado';
          if (error.code === error.TIMEOUT) message = 'Tiempo de espera agotado al obtener ubicación';
          if (error.code === error.POSITION_UNAVAILABLE) message = 'Ubicación no disponible';
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  },
};
