/**
 * Route service for fetching walking and driving paths using OSRM with resilient fallbacks
 */

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distanceMiles: number;
  distanceKm: number;
  distanceFormatted: string;
  durationMinutes: number;
  durationFormatted: string;
  mode: 'walking' | 'driving';
  isFallback?: boolean;
}

/**
 * Generates an interpolated path between two points with a natural road-like curvature
 * Used as a fallback if online routing service is unavailable.
 */
function generateCurvedFallbackPath(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  numPoints = 25
): [number, number][] {
  const points: [number, number][] = [];
  
  // Calculate perpendicular vector for a gentle natural curve
  const dx = endLng - startLng;
  const dy = endLat - startLat;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Curve offset amount (subtle, 8% of distance)
  const perpX = -dy * 0.08;
  const perpY = dx * 0.08;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic bezier curve with control point offset
    const curveT = Math.sin(t * Math.PI); // 0 at ends, 1 in middle
    const lat = startLat + dy * t + perpY * curveT;
    const lng = startLng + dx * t + perpX * curveT;
    points.push([lat, lng]);
  }

  return points;
}

/**
 * Calculates Great-Circle distance in miles
 */
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function fetchRoutePath(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: 'walking' | 'driving'
): Promise<RouteData> {
  const straightDistMiles = haversineMiles(startLat, startLng, endLat, endLng);
  const straightDistKm = straightDistMiles * 1.60934;

  const profile = mode === 'walking' ? 'foot' : 'driving';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM GeoJSON coords are [longitude, latitude] -> convert to Leaflet [lat, lng]
        const rawCoords: [number, number][] = route.geometry.coordinates;
        const coordinates: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

        const distanceMeters = route.distance || straightDistKm * 1000;
        const durationSec = route.duration || (mode === 'walking' ? (straightDistKm / 4.8) * 3600 : (straightDistKm / 35) * 3600);

        const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
        const distanceMiles = Math.round((distanceMeters * 0.000621371) * 10) / 10;
        const durationMinutes = Math.max(1, Math.round(durationSec / 60));

        let durationFormatted = `${durationMinutes} min`;
        if (durationMinutes >= 60) {
          const hrs = Math.floor(durationMinutes / 60);
          const mins = durationMinutes % 60;
          durationFormatted = mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
        }

        const distanceFormatted = distanceKm < 1 ? `${Math.round(distanceMeters)} m` : `${distanceKm} km (${distanceMiles} mi)`;

        return {
          coordinates,
          distanceMiles,
          distanceKm,
          distanceFormatted,
          durationMinutes,
          durationFormatted,
          mode,
          isFallback: false,
        };
      }
    }
  } catch (err) {
    console.warn(`OSRM route fetch failed for mode: ${mode}, using resilient fallback route`, err);
  }

  // Resilient fallback path
  const fallbackCoords = generateCurvedFallbackPath(startLat, startLng, endLat, endLng);
  // Estimate distance and travel time
  const realisticFactor = mode === 'walking' ? 1.25 : 1.35; // roads are ~25-35% longer than straight lines
  const distanceMiles = Math.round(straightDistMiles * realisticFactor * 10) / 10;
  const distanceKm = Math.round(straightDistKm * realisticFactor * 10) / 10;

  // Average walking speed ~ 4.8 km/h (3 mph)
  // Average city driving speed ~ 32 km/h (20 mph)
  const speedMph = mode === 'walking' ? 3.0 : 20.0;
  const durationMinutes = Math.max(1, Math.round((distanceMiles / speedMph) * 60));

  let durationFormatted = `${durationMinutes} min`;
  if (durationMinutes >= 60) {
    const hrs = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    durationFormatted = mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }

  const distanceFormatted = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm} km (${distanceMiles} mi)`;

  return {
    coordinates: fallbackCoords,
    distanceMiles,
    distanceKm,
    distanceFormatted,
    durationMinutes,
    durationFormatted,
    mode,
    isFallback: true,
  };
}
