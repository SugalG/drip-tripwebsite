import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, ExternalLink, KeyRound, Settings2, Store } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useBranch } from "@/contexts/BranchContext";
import { Branch } from "@/types/branch";
import { Product } from "@/types/product";
import { AuthMeResponse } from "@/types/user";

import AdminTopBar from "@/components/admin/AdminTopBar";
import BranchSettingsForm from "@/components/admin/BranchSettingsForm";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";
import ProductForm from "@/components/admin/ProductForm";
import ProductList from "@/components/admin/ProductList";
import SuperadminBranchSetup from "@/components/admin/SuperadminBranchSetup";
import { useProductForm } from "@/components/admin/hooks/useProductForm";

export default function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { branch } = useBranch();

  const { data: authState, isLoading: authLoading } = useQuery<AuthMeResponse>({
    queryKey: ["auth-me"],
    queryFn: api.getCurrentUser,
  });

  const user = authState?.user;
  const isSuperadmin = user?.role === "SUPERADMIN";
  const [activeSection, setActiveSection] = useState<"products" | "settings" | "password">(
    "products"
  );

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: api.getProducts,
    enabled: !isSuperadmin,
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

  if (authLoading) return <div>Loading account...</div>;

  if (isSuperadmin) {
    return (
      <div className="min-h-screen gradient-hero px-3 py-6 sm:px-4 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <AdminTopBar onLogout={handleLogout} user={user} branch={branch} />
          <div className="grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-6">
              <PasswordChangeForm />
            </div>
            <SuperadminBranchSetup />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <div>Loading products...</div>;
  if (isError || !products) return <div>Products couldn't be fetched</div>;

  return (
    <div className="min-h-screen gradient-hero px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <AdminTopBar onLogout={handleLogout} user={user} branch={branch} />

        <div className="mb-6 rounded-[1.25rem] border border-border/60 bg-white/78 p-5 shadow-card backdrop-blur-xl sm:rounded-[1.75rem] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Store className="h-3.5 w-3.5" />
                Branch Workspace
              </div>
              <h2 className="text-2xl font-display font-bold gradient-text sm:text-3xl">
                {branch?.name || "Branch Dashboard"}
              </h2>
              <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                <span className="break-all">Storefront: {branch?.hostname || "Loading..."}</span>
                <span>Signed in as: {user?.username || "admin"}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Username, branch assignment, slug, and hostname are managed by the superadmin.
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium hover:border-primary"
            >
              <ExternalLink className="h-4 w-4" />
              Open Storefront
            </a>
          </div>
        </div>

        <div className="mb-6 grid gap-2 rounded-[1.25rem] border border-border/60 bg-white/70 p-2 shadow-sm backdrop-blur-xl sm:grid-cols-3">
          {[
            { id: "products" as const, label: "Products", icon: Boxes },
            { id: "settings" as const, label: "Storefront Details", icon: Settings2 },
            { id: "password" as const, label: "Password", icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {activeSection === "password" && <PasswordChangeForm username={user?.username} />}

        {activeSection === "settings" && (
          <BranchSettingsForm
            branch={branch}
            onSaved={(updatedBranch: Branch) => {
              qc.setQueryData(["current-branch"], updatedBranch);
            }}
          />
        )}

        {activeSection === "products" && (
          <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
            <ProductForm form={form} />
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-border/60 bg-white/75 backdrop-blur-xl px-5 py-5 shadow-card sm:rounded-[1.75rem] sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div className="text-2xl font-display font-bold gradient-text">
                    Product Inventory
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {products.length} {products.length === 1 ? "product" : "products"}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Everything listed here is visible only on this branch domain.
                </p>
              </div>
              <ProductList products={products} onEdit={form.editProduct} onDelete={handleDelete} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
