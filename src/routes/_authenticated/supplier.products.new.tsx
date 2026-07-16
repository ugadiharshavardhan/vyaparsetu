import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
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
  const router = useRouter();
  const { create } = useSupplierProducts();
  const { warehouses } = useWarehouses();

  const goBackToList = useCallback(() => {
    const saved = sessionStorage.getItem("vs:supplier:products:search");
    if (saved) {
      try {
        const search = JSON.parse(saved);
        navigate({ to: "/supplier/products", search });
        return;
      } catch {
        // fall through
      }
    }
    if (window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: "/supplier/products" });
    }
  }, [navigate, router]);

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
                goBackToList();
              })
              .catch((e: Error) => toast.error(e.message));
          }}
          onCancel={goBackToList}
        />
      </div>
    
  );
}

