import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { reverseGeocode, searchPlaces, type GeocodeResult } from "@/lib/geocode";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vite-friendly default marker icons
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

type Props = {
  latitude: number | null;
  longitude: number | null;
  onPinned: (result: GeocodeResult) => void;
  onClearPin?: () => void;
  className?: string;
};

function MapFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AddressMapPicker({ latitude, longitude, onPinned, onClearPin, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [openList, setOpenList] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return [latitude, longitude];
    }
    return INDIA_CENTER;
  }, [latitude, longitude]);

  const zoom = latitude != null && longitude != null ? 16 : 5;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = window.setTimeout(() => {
      setSearching(true);
      void searchPlaces(q)
        .then((list) => {
          setResults(list);
          setOpenList(true);
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const applyPin = async (lat: number, lng: number, preset?: GeocodeResult) => {
    setPinning(true);
    try {
      if (preset) {
        onPinned(preset);
        return;
      }
      const geo = await reverseGeocode(lat, lng);
      onPinned(geo ?? { lat, lng, displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    } finally {
      setPinning(false);
    }
  };

  if (!mounted) {
    return (
      <div className={cn("grid h-64 place-items-center rounded-xl border border-border bg-secondary/40", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpenList(true)}
          placeholder="Search place, area, city… then pin on map"
          className="pl-9 pr-10"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {openList && results.length > 0 && (
          <ul className="absolute z-[1000] mt-1 max-h-48 w-full overflow-auto rounded-xl border border-border bg-card shadow-elevated">
            {results.map((r) => (
              <li key={`${r.lat}-${r.lng}-${r.displayName}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-secondary"
                  onClick={() => {
                    setQuery(r.displayName);
                    setOpenList(false);
                    void applyPin(r.lat, r.lng, r);
                  }}
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span className="line-clamp-2">{r.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="z-0 h-64 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo center={center} zoom={zoom} />
          <MapClickHandler onPick={(lat, lng) => void applyPin(lat, lng)} />
          {latitude != null && longitude != null && (
            <Marker
              position={[latitude, longitude]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = e.target.getLatLng();
                  void applyPin(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {pinning
            ? "Updating pin…"
            : latitude != null && longitude != null
              ? `Pinned at ${latitude.toFixed(5)}, ${longitude.toFixed(5)} — drag or click to adjust`
              : "Search a place or click the map to drop a pin"}
        </span>
        {latitude != null && longitude != null && onClearPin && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px]"
            onClick={onClearPin}
          >
            Clear pin
          </Button>
        )}
      </div>
    </div>
  );
}
