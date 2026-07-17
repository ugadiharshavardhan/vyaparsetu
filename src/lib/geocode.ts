export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    state_district?: string;
    postcode?: string;
    country?: string;
  };
};

function parseNominatim(item: NominatimResult): GeocodeResult {
  const a = item.address ?? {};
  const city = a.city || a.town || a.village || a.county || undefined;
  const state = a.state || a.state_district || undefined;
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const locality = a.neighbourhood || a.suburb || "";

  // Build a useful street/area line. Prefer road (+ house number) and the local
  // area; fall back to the leading part of the full display name (dropping the
  // city/state/pincode/country tail so line1 isn't a duplicate of those).
  let line1 = [street, locality].filter(Boolean).join(", ");
  if (!line1) {
    const tail = new Set(
      [city, state, a.postcode, a.country].filter(Boolean).map((v) => String(v).toLowerCase()),
    );
    line1 = item.display_name
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !tail.has(s.toLowerCase()))
      .slice(0, 2)
      .join(", ");
  }

  return {
    lat: Number(item.lat),
    lng: Number(item.lon),
    displayName: item.display_name,
    line1: line1 || undefined,
    city,
    state,
    pincode: a.postcode?.replace(/\s+/g, "") || undefined,
    country: a.country || "India",
  };
}

const HEADERS = {
  Accept: "application/json",
};

/** Search places in India via OpenStreetMap Nominatim. */
export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("q", q);
  const res = await fetch(url.toString(), { headers: HEADERS });
  if (!res.ok) throw new Error("Place search failed");
  const data = (await res.json()) as NominatimResult[];
  return data.map(parseNominatim).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
}

/** Reverse-geocode a map pin into address parts. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  const res = await fetch(url.toString(), { headers: HEADERS });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimResult;
  if (!data?.lat || !data?.lon) return null;
  return parseNominatim(data);
}
