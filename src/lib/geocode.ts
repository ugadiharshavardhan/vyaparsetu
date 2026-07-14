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
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const locality = a.neighbourhood || a.suburb || "";
  return {
    lat: Number(item.lat),
    lng: Number(item.lon),
    displayName: item.display_name,
    line1: street || locality || undefined,
    city: a.city || a.town || a.village || a.county || undefined,
    state: a.state || a.state_district || undefined,
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
