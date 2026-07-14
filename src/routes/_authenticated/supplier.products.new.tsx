import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ProductForm, emptyDraft } from "@/components/supplier/ProductForm";
import { useSupplierProducts, useWarehouses } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/products/new")({
  head: () => ({ meta: [{ title: "New Product — Supplier" }] }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const { create } = useSupplierProducts();
  const { warehouses } = useWarehouses();
  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="New product" description="Add a fresh SKU to your storefront." />
        <ProductForm
          initial={emptyDraft(warehouses[0]?.id ?? "")}
          submitLabel="Publish product"
          onSubmit={(draft) => {
            void create(draft)
              .then(() => {
                toast.success("Product created");
                navigate({ to: "/supplier/products" });
              })
              .catch((e: Error) => toast.error(e.message));
          }}
        />
      </div>
    
  );
}
