import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number;
  className?: string;
  /** Optional label shown under the map (e.g. full address). */
  label?: string;
};

/**
 * Read-only Leaflet map that drops a pin at the given coordinates.
 * Renders a graceful fallback when no coordinates are available.
 */
export function LocationMap({ latitude, longitude, zoom = 15, className, label }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasPin =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!hasPin) {
    return (
      <div
        className={cn(
          "grid h-40 place-items-center rounded-xl border border-dashed border-border bg-secondary/30 text-center",
          className,
        )}
      >
        <div className="px-4">
          <MapPin className="mx-auto h-6 w-6 text-muted-foreground/60" />
          <p className="mt-1 text-xs text-muted-foreground">
            No map location saved for this order
          </p>
          {label && <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>}
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          "grid h-40 place-items-center rounded-xl border border-border bg-secondary/40",
          className,
        )}
      >
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const center: [number, number] = [latitude as number, longitude as number];

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          dragging
          className="z-0 h-40 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        {label ? <span className="truncate">{label}</span> : <span />}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-medium text-brand hover:underline"
        >
          Open in Maps
        </a>
      </div>
    </div>
  );
}
