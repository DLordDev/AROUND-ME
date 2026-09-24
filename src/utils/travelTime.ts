import { UserLocation, Place } from '../types';

/**
 * Calculates great-circle distance between two GPS coordinates using Haversine formula
 * Returns distance in miles.
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    (lat1 === 0 && lon1 === 0) ||
    (lat2 === 0 && lon2 === 0)
  ) {
    return 1.0;
  }

  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.max(0.05, Math.round(distance * 10) / 10);
}

export interface TravelEstimates {
  distanceMiles: number;
  distanceFormatted: string;
  walkMinutes: number;
  walkFormatted: string;
  walkBadge: string;
  driveMinutes: number;
  driveFormatted: string;
  driveBadge: string;
  walkSteps: number;
  walkCalories: number;
  walkDirectionsUrl: string;
  driveDirectionsUrl: string;
}

/**
 * Computes realistic walking and driving travel time estimates based on user location and place coords.
 */
export function getTravelEstimates(
  userLocation: UserLocation | null | undefined,
  place: Pick<Place, 'lat' | 'lng' | 'distanceMiles' | 'name' | 'address'>
): TravelEstimates {
  let distance = place.distanceMiles || 1.0;

  if (
    userLocation &&
    userLocation.latitude &&
    userLocation.longitude &&
    place.lat &&
    place.lng
  ) {
    const computed = calculateDistanceMiles(
      userLocation.latitude,
      userLocation.longitude,
      place.lat,
      place.lng
    );
    if (computed > 0 && computed < 100) {
      distance = computed;
    }
  }

  // Walking: ~3.0 mph average city pace (~20 min/mile), plus 1 min pedestrian buffer
  // E.g., 0.1 mi = 2-3 min, 0.5 mi = 11 min, 1.0 mi = 21 min
  const walkMinutes = Math.max(1, Math.round(distance * 20 + 1));

  // Driving: ~22 mph city traffic with traffic signals, turning, and parking delay
  // E.g., ~2.7 min/mile + 2 min baseline for lights/starting/parking
  const driveMinutes = Math.max(1, Math.round(distance * 2.7 + 2));

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const walkFormatted = formatMinutes(walkMinutes);
  const driveFormatted = formatMinutes(driveMinutes);

  const walkBadge = walkMinutes < 60 ? `${walkMinutes}m walk` : walkFormatted;
  const driveBadge = driveMinutes < 60 ? `${driveMinutes}m drive` : driveFormatted;

  const walkSteps = Math.round(distance * 2000);
  const walkCalories = Math.round(distance * 75);

  const destCoords =
    place.lat && place.lng ? `${place.lat},${place.lng}` : encodeURIComponent(place.name || place.address);

  const originCoords =
    userLocation && userLocation.latitude && userLocation.longitude
      ? `${userLocation.latitude},${userLocation.longitude}`
      : '';

  const walkDirectionsUrl = originCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}&travelmode=walking`
    : `https://www.google.com/maps/dir/?api=1&destination=${destCoords}&travelmode=walking`;

  const driveDirectionsUrl = originCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${destCoords}&travelmode=driving`;

  return {
    distanceMiles: distance,
    distanceFormatted: `${distance.toFixed(1)} mi`,
    walkMinutes,
    walkFormatted,
    walkBadge,
    driveMinutes,
    driveFormatted,
    driveBadge,
    walkSteps,
    walkCalories,
    walkDirectionsUrl,
    driveDirectionsUrl,
  };
}
