import { Building2, Home, Warehouse, Star, Pencil, Trash2 } from "lucide-react";
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
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
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
        {address.gst_number && (
          <div className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">
            GST: {address.gst_number}
          </div>
        )}
      </div>
      {!address.is_default && onSetDefault && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault();
          }}
        >
          Set as default
        </Button>
      )}
    </div>
  );
}
