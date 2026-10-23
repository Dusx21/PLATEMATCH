import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

export function useLocation() {
  const [location, setLocation] = useState(() => locationService.getCurrentSavedLocation());
  const [radius, setRadius] = useState(() => locationService.getGeofenceRadius());
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleLocationChange = (e) => {
      if (e.detail) setLocation(e.detail);
    };
    const handleRadiusChange = (e) => {
      if (e.detail) setRadius(e.detail);
    };

    window.addEventListener('platematch_location_changed', handleLocationChange);
    window.addEventListener('platematch_radius_changed', handleRadiusChange);

    return () => {
      window.removeEventListener('platematch_location_changed', handleLocationChange);
      window.removeEventListener('platematch_radius_changed', handleRadiusChange);
    };
  }, []);

  const changeLocation = useCallback((newLoc) => {
    locationService.saveSelectedLocation(newLoc);
    setLocation(newLoc);
    setError(null);
  }, []);

  const changeRadius = useCallback((newRadius) => {
    locationService.saveGeofenceRadius(newRadius);
    setRadius(newRadius);
  }, []);

  const requestGps = useCallback(async () => {
    setIsLocating(true);
    setError(null);
    try {
      const gpsLoc = await locationService.requestBrowserLocation();
      setLocation(gpsLoc);
      return gpsLoc;
    } catch (err) {
      setError(err.message || 'No se pudo obtener la ubicación GPS');
      throw err;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return {
    location,
    radius,
    isLocating,
    error,
    changeLocation,
    changeRadius,
    requestGps,
  };
}
