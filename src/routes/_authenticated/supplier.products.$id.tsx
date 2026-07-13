import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const product = useSupplierProduct(id);
  const { updateProduct, remove } = useSupplierProducts();
  const navigate = useNavigate();

  if (!product) {
    return (
      
        <div className="container-page py-10">
          <PageHeader title="Product not found" description="This product may have been deleted." />
          <Button className="mt-6" onClick={() => navigate({ to: "/supplier/products" })}>Back to products</Button>
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
                remove(product.id);
                toast.success("Product deleted");
                navigate({ to: "/supplier/products" });
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
            updateProduct(product.id, patch);
            toast.success("Product updated");
          }}
        />
      </div>
    
  );
}
