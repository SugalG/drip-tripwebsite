import { motion } from "framer-motion";
import { Edit, Eye, EyeOff, PackagePlus, Trash2 } from "lucide-react";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (product: Product) => void;
  visibilityUpdatingId?: string | null;
};

export default function ProductList({
  products,
  onEdit,
  onDelete,
  onToggleVisibility,
  visibilityUpdatingId,
}: Props) {
  if (!products.length) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-border bg-white/75 p-8 text-center shadow-sm sm:rounded-[1.75rem]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PackagePlus className="h-6 w-6" />
        </div>
        <div className="text-lg font-semibold">No products yet</div>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Add your first product with images, pricing, and options. It will appear only on this
          branch storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => {
        const cover =
          product.imageUrl?.[product.coverIndex] || product.imageUrl?.[0] || "";
        const hidden = product.isVisible === false;
        const visibilityUpdating = visibilityUpdatingId === product.id;

        return (
          <div
            key={product.id}
            className="p-4 rounded-[1.5rem] bg-white/80 backdrop-blur-xl border border-border/70 flex flex-col justify-between shadow-card"
          >
            <img
              src={cover}
              alt={product.name}
              className="w-full h-44 object-cover rounded-[1.25rem] mb-3 bg-background"
            />

            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="font-semibold pr-3">{product.name}</h3>
              <div className="flex shrink-0 gap-2">
                <motion.button
                  className="p-2 rounded-full bg-slate-900 text-background"
                  onClick={() => onEdit(product)}
                  whileHover={{ scale: 1.1 }}
                >
                  <Edit className="w-4 h-4" />
                </motion.button>

                <motion.button
                  className="p-2 rounded-full bg-red-500 text-background"
                  onClick={() => onDelete(product.id)}
                  whileHover={{ scale: 1.1 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  hidden
                    ? "bg-slate-900 text-white"
                    : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                }`}
              >
                {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {hidden ? "Hidden" : "Visible"}
              </span>
              <button
                type="button"
                onClick={() => onToggleVisibility(product)}
                disabled={visibilityUpdating}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {visibilityUpdating
                  ? "Saving..."
                  : hidden
                    ? "Show on Store"
                    : "Hide from Store"}
              </button>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
              {product.description}
            </p>

            {product.flavors?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {product.flavors.slice(0, 3).map((f) => (
                  <span
                    key={f.id}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {f.name}
                  </span>
                ))}
                {product.flavors.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    +{product.flavors.length - 3}
                  </span>
                )}
              </div>
            )}

            <p className="font-bold mt-3 text-lg">NPR {product.price.toLocaleString("en-NP")}</p>
          </div>
        );
      })}
    </div>
  );
}
