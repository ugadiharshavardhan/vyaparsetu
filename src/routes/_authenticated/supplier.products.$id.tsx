import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ProductForm } from "@/components/supplier/ProductForm";
import { Button } from "@/components/ui/button";
import { useSupplierProduct, useSupplierProducts } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/products/$id")({
  head: () => ({ meta: [{ title: "Edit Product — Supplier" }] }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const { product, isLoading } = useSupplierProduct(id);
  const { updateProduct, remove } = useSupplierProducts();
  const navigate = useNavigate();
  const router = useRouter();

  /**
   * Navigate back to the product list, preserving URL search params.
   * Uses history.back() so the browser restores the previous URL with all
   * filters, pagination, sort, and search state intact.
   * Falls back to direct navigation if there's no prior history entry
   * (e.g. the user deep-linked directly to the edit page).
   */
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
    // No saved state — try browser back, fall back to plain navigate
    if (window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: "/supplier/products" });
    }
  }, [navigate, router]);

  if (isLoading) {
    return (
      <div className="container-page py-10">
        <PageHeader title="Loading product…" description="Fetching from catalog." />
      </div>
    );
  }

  if (!product) {
    return (
        <div className="container-page py-10">
          <PageHeader title="Product not found" description="This product may have been deleted." />
          <Button className="mt-6" onClick={goBackToList}>Back to products</Button>
        </div>
    );
  }

  const { id: _id, createdAt: _c, updatedAt: _u, ...initial } = product;
  void _id; void _c; void _u;

  return (
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title={product.name}
          description={`SKU ${product.sku} • last updated ${new Date(product.updatedAt).toLocaleString()}`}
          action={
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                void remove(product.id)
                  .then(() => {
                    toast.success("Product deleted");
                    goBackToList();
                  })
                  .catch((e: Error) => toast.error(e.message));
              }}
            >
              Delete product
            </Button>
          }
        />
        <ProductForm
          initial={initial}
          submitLabel="Save changes"
          onSubmit={(patch) => {
            void updateProduct(product.id, patch)
              .then(() => {
                toast.success("Product updated");
                goBackToList();
              })
              .catch((e: Error) => toast.error(e.message));
          }}
          onCancel={goBackToList}
        />
      </div>
  );
}
