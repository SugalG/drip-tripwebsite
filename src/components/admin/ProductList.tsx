import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
};

export default function ProductList({ products, onEdit, onDelete }: Props) {
  return (
    <div className="w-full max-w-3xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const cover =
          product.imageUrl?.[product.coverIndex] || product.imageUrl?.[0] || "";

        return (
          <div
            key={product.id}
            className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between"
          >
            <img
              src={cover}
              alt={product.name}
              className="w-full h-40 object-cover rounded-xl mb-2"
            />

            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{product.name}</h3>
              <div className="flex gap-2">
                <motion.button
                  className="p-1 rounded-full bg-gray-900 text-background"
                  onClick={() => onEdit(product)}
                  whileHover={{ scale: 1.1 }}
                >
                  <Edit className="w-4 h-4" />
                </motion.button>

                <motion.button
                  className="p-1 rounded-full bg-red-500 text-background"
                  onClick={() => onDelete(product.id)}
                  whileHover={{ scale: 1.1 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

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

            <p className="font-bold mt-2">NPR {product.price.toLocaleString("en-NP")}</p>
          </div>
        );
      })}
    </div>
  );
}