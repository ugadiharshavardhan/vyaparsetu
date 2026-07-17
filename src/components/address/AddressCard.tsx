import { Building2, Home, Warehouse, Star, Pencil, Trash2, MapPin } from "lucide-react";
import type { ShippingAddress } from "@/types/commerce";
import { Button } from "@/components/ui/button";

const ICONS = { home: Home, business: Building2, warehouse: Warehouse } as const;

export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: ShippingAddress;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}) {
  const Icon = ICONS[address.type];
  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
        selected
          ? "border-brand bg-brand/5 shadow-brand"
          : "border-border bg-card hover:border-brand/40 hover:shadow-soft"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {address.label || address.type.charAt(0).toUpperCase() + address.type.slice(1)}
              {address.is_default && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                  <Star className="h-2.5 w-2.5 fill-current" /> Default
                </span>
              )}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{address.type}</div>
          </div>
        </div>
        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-0.5 text-sm">
        <div className="font-medium text-foreground">{address.contact_name}</div>
        <div className="text-muted-foreground">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
        </div>
        <div className="text-muted-foreground">
          {address.city}, {address.state} — {address.pincode}
        </div>
        <div className="text-muted-foreground">Phone: {address.phone}</div>
        {address.latitude != null && address.longitude != null && (
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand">
            <MapPin className="h-3 w-3" />
            Pin {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
          </div>
        )}
        {address.gst_number && (
          <div className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">
            GST: {address.gst_number}
          </div>
        )}
      </div>
      {(onSetDefault || onDelete) && (
        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-2">
          {!address.is_default && onSetDefault && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault();
              }}
            >
              Set as default
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
