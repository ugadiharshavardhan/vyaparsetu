import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddresses";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressFormDialog } from "@/components/address/AddressForm";
import type { ShippingAddress } from "@/types/commerce";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Addresses — VyaparSetu" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const { data = [], isLoading } = useAddresses();
  const del = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingAddress | null>(null);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (a: ShippingAddress) => {
    setEditing(a);
    setOpen(true);
  };

  return (
    <>
      <div className="container-page py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <PageHeader title="Shipping addresses" description="Manage delivery locations for your orders." />
          <Button onClick={openNew} className="shadow-brand">
            <Plus className="mr-1.5 h-4 w-4" /> Add address
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold">No addresses yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first shipping address to enable one-click checkout.
            </p>
            <Button className="mt-5 shadow-brand" onClick={openNew}>Add first address</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={() => openEdit(a)}
                onDelete={() => del.mutate(a.id)}
                onSetDefault={() => setDefault.mutate(a.id)}
              />
            ))}
          </div>
        )}
      </div>
      <AddressFormDialog open={open} onOpenChange={setOpen} initial={editing} />
    </>
  );
}

