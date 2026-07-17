import { useCallback, useEffect, useState } from "react";
import {
  detectCityFromGeolocation,
  hasAttemptedGeoDetect,
  markGeoDetectAttempted,
  readDeliveryLocation,
  writeDeliveryLocation,
} from "@/lib/deliveryLocation";

/**
 * Delivery-location state for the navbar.
 * On first visit (no saved city, not yet attempted) it asks the browser for the
 * user's location and reverse-geocodes it to a city shown in the navbar.
 */
export function useDeliveryLocation() {
  const [location, setLocation] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const stored = readDeliveryLocation();
    if (stored) {
      setLocation(stored);
      return;
    }
    if (hasAttemptedGeoDetect()) return;

    markGeoDetectAttempted();
    setDetecting(true);
    detectCityFromGeolocation()
      .then((city) => {
        if (city) {
          setLocation(city);
          writeDeliveryLocation(city);
        }
      })
      .finally(() => setDetecting(false));
  }, []);

  const select = useCallback((city: string) => {
    setLocation(city);
    writeDeliveryLocation(city);
  }, []);

  /** Manually (re)trigger geolocation detection, e.g. from a "Use my location" action. */
  const detect = useCallback(async () => {
    setDetecting(true);
    try {
      markGeoDetectAttempted();
      const city = await detectCityFromGeolocation();
      if (city) {
        setLocation(city);
        writeDeliveryLocation(city);
      }
      return city;
    } finally {
      setDetecting(false);
    }
  }, []);

  return { location, detecting, select, detect };
}
