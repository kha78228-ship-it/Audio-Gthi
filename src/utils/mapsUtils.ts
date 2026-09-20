// Utility functions for Haevy Maps

/**
 * Calculates great-circle distance between two points on a sphere (Haversine formula) in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Formats distance with appropriate unit (m or km)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates travel duration for different transport modes
 */
export function estimateTravelTime(distanceKm: number): {
  drivingMin: number;
  motorcycleMin: number;
  walkingMin: number;
} {
  // Average urban speeds: Car ~25km/h, Bike ~30km/h, Walking ~4.5km/h
  const drivingMin = Math.max(1, Math.round((distanceKm / 25) * 60));
  const motorcycleMin = Math.max(1, Math.round((distanceKm / 30) * 60));
  const walkingMin = Math.max(1, Math.round((distanceKm / 4.5) * 60));
  return { drivingMin, motorcycleMin, walkingMin };
}

/**
 * Checks if a point is inside a circular safe zone
 */
export function isPointInsideRadius(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): boolean {
  const distKm = calculateDistanceKm(pointLat, pointLng, centerLat, centerLng);
  return distKm * 1000 <= radiusMeters;
}
