export const DELIVERY_LOCATIONS = ["Hyderabad", "Bengaluru"] as const;

export type DeliveryLocation = (typeof DELIVERY_LOCATIONS)[number];

const STORAGE_KEY = "vs.delivery-location.v1";

export function isDeliveryLocation(value: string | null | undefined): value is DeliveryLocation {
  return !!value && (DELIVERY_LOCATIONS as readonly string[]).includes(value);
}

export function readDeliveryLocation(): DeliveryLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isDeliveryLocation(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeDeliveryLocation(city: DeliveryLocation) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, city);
  } catch {
    /* ignore quota / private mode */
  }
}
