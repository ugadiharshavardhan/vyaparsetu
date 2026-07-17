/** Quick-pick cities offered in the location dropdown (also used for stats). */
export const DELIVERY_LOCATIONS = ["Hyderabad", "Bengaluru"] as const;

export type DeliveryLocation = (typeof DELIVERY_LOCATIONS)[number];

const STORAGE_KEY = "vs.delivery-location.v1";
const DETECT_ATTEMPTED_KEY = "vs.delivery-location.detect-attempted.v1";

export function isDeliveryLocation(value: string | null | undefined): value is DeliveryLocation {
  return !!value && (DELIVERY_LOCATIONS as readonly string[]).includes(value);
}

/** Read the saved delivery city (any city name, not just the quick picks). */
export function readDeliveryLocation(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

export function writeDeliveryLocation(city: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, city);
  } catch {
    /* ignore quota / private mode */
  }
}

/** True once we've asked the browser for geolocation (so we don't re-prompt every visit). */
export function hasAttemptedGeoDetect(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(DETECT_ATTEMPTED_KEY) === "1";
  } catch {
    return true;
  }
}

export function markGeoDetectAttempted() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DETECT_ATTEMPTED_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Ask the browser for the user's location and reverse-geocode it to a city name.
 * Uses BigDataCloud's free, key-less, CORS-enabled reverse geocoder.
 * Returns null if permission is denied or lookup fails.
 */
export async function detectCityFromGeolocation(): Promise<string | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) return null;

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  });
  if (!position) return null;

  const { latitude, longitude } = position.coords;
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
    };
    const city = data.city || data.locality || data.principalSubdivision || "";
    return city ? String(city).trim() : null;
  } catch {
    return null;
  }
}
