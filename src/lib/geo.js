/**
 * Hyperlocal Geolocation & Distance Utilities
 * Formula: Haversine
 * Focus: Cusco, Peru
 */

/**
 * Benchmark locations in Cusco for demo & testing
 */
export const CUSCO_DEMO_LOCATIONS = [
  {
    id: 'uac_larapa',
    name: 'Campus UAC · Larapa (ExpoAndina)',
    description: 'Universidad Andina del Cusco - Puerta Principal',
    latitude: -13.5280,
    longitude: -71.9048,
    isDefault: true,
  },
  {
    id: 'plaza_armas',
    name: 'Plaza de Armas · Centro Histórico',
    description: 'Catedral del Cusco',
    latitude: -13.5167,
    longitude: -71.9788,
    isDefault: false,
  },
  {
    id: 'san_jeronimo_centro',
    name: 'Plaza de San Jerónimo',
    description: 'Zona de picanterías tradicionales',
    latitude: -13.5385,
    longitude: -71.8842,
    isDefault: false,
  },
  {
    id: 'magisterio',
    name: 'Urb. Magisterio · Av. La Cultura',
    description: 'Zona gastronómica y comercial',
    latitude: -13.5230,
    longitude: -71.9280,
    isDefault: false,
  },
];

/**
 * Calculates great-circle distance between two points in meters using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in meters (rounded)
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return null;
  }

  const R = 6371000; // Earth's mean radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates estimated walking time in minutes
 * Standard average walking speed: 80 meters/min (~4.8 km/h) in urban terrain
 * @param {number} distanceMeters
 * @returns {number} minutes
 */
export function calculateWalkingTimeMinutes(distanceMeters) {
  if (!distanceMeters || distanceMeters < 0) return 1;
  const minutes = Math.ceil(distanceMeters / 80);
  return Math.max(1, minutes);
}

/**
 * Formats distance and walking time in user-friendly Spanish
 * @param {number|null} meters
 * @returns {{ distanceText: string, walkText: string, fullText: string }}
 */
export function formatDistanceAndWalk(meters) {
  if (meters === null || meters === undefined) {
    return {
      distanceText: 'Distancia no disp.',
      walkText: '-- min',
      fullText: 'Distancia no disponible',
    };
  }

  let distanceText = '';
  if (meters < 1000) {
    distanceText = `${meters} m`;
  } else {
    distanceText = `${(meters / 1000).toFixed(1)} km`;
  }

  const mins = calculateWalkingTimeMinutes(meters);
  const walkText = `${mins} min a pie`;

  return {
    distanceText,
    walkText,
    fullText: `${distanceText} · ${walkText}`,
  };
}

/**
 * Generates a Google Maps walking directions URL
 * @param {number} destLat - Destination latitude
 * @param {number} destLng - Destination longitude
 * @param {string} destName - Destination name for label
 * @param {number|null} originLat - Optional origin latitude
 * @param {number|null} originLng - Optional origin longitude
 * @returns {string} Google Maps URL
 */
export function getGoogleMapsWalkingUrl(destLat, destLng, destName = 'Restaurante', originLat = null, originLng = null) {
  const encodedDestName = encodeURIComponent(destName);
  const destination = `${destLat},${destLng}`;

  if (originLat !== null && originLng !== null) {
    const origin = `${originLat},${originLng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${encodedDestName}&travelmode=walking`;
}
