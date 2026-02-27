import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/types/product";

import AdminTopBar from "@/components/admin/AdminTopBar";
import ProductForm from "@/components/admin/ProductForm";
import ProductList from "@/components/admin/ProductList";
import { useProductForm } from "@/components/admin/hooks/useProductForm";

export default function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: api.getProducts,
  });

  const form = useProductForm(() => {
    qc.invalidateQueries({ queryKey: ["products"] });
  });

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { res, data } = await api.deleteProduct(id);
    if (!res.ok) {
      // show message in form area
      form.resetForm();
      // keep it simple, or you can create a toast
      alert(data?.message || data?.error || "Failed to delete product ❌");
      return;
    }

    qc.invalidateQueries({ queryKey: ["products"] });
  };

  if (isLoading) return <div>Loading.............</div>;
  if (isError || !products) return <div>Products couldn't be fetched</div>;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start p-4 pt-10">
      <AdminTopBar onLogout={handleLogout} />
      <ProductForm form={form} />
      <ProductList products={products} onEdit={form.editProduct} onDelete={handleDelete} />
    </div>
  );
}