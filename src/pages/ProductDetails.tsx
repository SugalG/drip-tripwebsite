import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useBranch } from "@/contexts/BranchContext";
import {
  PRODUCT_VISIBILITY_EVENT_KEY,
  parseProductVisibilityEvent,
} from "@/lib/productVisibilityEvents";

interface Flavor {
  id: string;
  name: string;
}

interface Ohm {
  id: string;
  value: string;
}

interface Color {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string[];
  coverIndex: number;
  ohms: Ohm[];
  flavors: Flavor[];
  colors: Color[];
  isVisible: boolean;
}

const formatNPR = (price: number) => `NPR ${price.toLocaleString("en-NP")}`;
const formatCategory = (category: string) => (category === "Mods" ? "Devices" : category);

export default function ProductDetails() {
  const { id } = useParams();
  const { branch } = useBranch();
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState<string>("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const {
    data: product = null,
    isLoading: loading,
    isError,
  } = useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: () => (id ? api.getProduct(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    retry: false,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  const publicProduct = isError ? null : product;

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [id]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PRODUCT_VISIBILITY_EVENT_KEY) return;

      const visibilityEvent = parseProductVisibilityEvent(event.newValue);
      if (!visibilityEvent || visibilityEvent.productId !== id) return;

      if (!visibilityEvent.isVisible) {
        queryClient.setQueryData(["product", id], null);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["product", id] });
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [id, queryClient]);

  useEffect(() => {
    if (!publicProduct) {
      setActiveImg("");
      return;
    }

    const cover =
      publicProduct.imageUrl?.[publicProduct.coverIndex ?? 0] || publicProduct.imageUrl?.[0] || "";
    setActiveImg((current) => {
      if (current && publicProduct.imageUrl?.includes(current)) return current;
      return cover;
    });
  }, [publicProduct]);

  const images = useMemo(() => publicProduct?.imageUrl || [], [publicProduct]);
  const whatsappNumber = branch?.whatsappNumber || branch?.phone || "9779828037561";
  const shouldShowDescriptionToggle =
    (publicProduct?.description.length || 0) > 180 ||
    Boolean(publicProduct?.description.includes("\n"));

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero px-4 py-10">
        <div className="container mx-auto max-w-6xl">Loading...</div>
      </div>
    );
  }

  if (!publicProduct) {
    return (
      <div className="min-h-screen gradient-hero px-4 py-10">
        <div className="container mx-auto max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
          <div className="p-6 rounded-3xl gradient-card shadow-card border border-border/50">
            Product not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl gradient-card shadow-card border border-border/50"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-vape-blue/10 to-vape-pink/10 flex items-center justify-center overflow-hidden">
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={publicProduct.name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="text-6xl">💨</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setActiveImg(img)}
                    className={`h-20 w-20 rounded-2xl border overflow-hidden transition ${
                      activeImg === img ? "border-primary" : "border-border"
                    }`}
                    title="View image"
                    type="button"
                  >
                    <img
                      src={img}
                      alt="thumb"
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-3xl gradient-card shadow-card border border-border/50"
          >
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">
              {formatCategory(publicProduct.category)}
            </span>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              {publicProduct.name}
            </h1>

            <div className="text-2xl font-bold gradient-text mb-5">
              {formatNPR(publicProduct.price)}
            </div>

            <div className="mb-5">
              <p
                className={`whitespace-pre-line text-muted-foreground leading-relaxed ${
                  descriptionExpanded ? "" : "line-clamp-3 sm:line-clamp-5"
                }`}
              >
                {publicProduct.description}
              </p>
              {shouldShowDescriptionToggle && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((value) => !value)}
                  className="mt-2 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  {descriptionExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {(publicProduct.ohms?.length > 0 ||
              publicProduct.flavors?.length > 0 ||
              publicProduct.colors?.length > 0) && (
              <div className="space-y-4 mb-6">
                {publicProduct.ohms?.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Available Ohms</div>
                    <div className="flex flex-wrap gap-2">
                      {publicProduct.ohms.map((ohm) => (
                        <span
                          key={ohm.id}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {ohm.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {publicProduct.flavors?.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Available Flavours</div>
                    <div className="flex flex-wrap gap-2">
                      {publicProduct.flavors.map((f) => (
                        <span
                          key={f.id}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {publicProduct.colors?.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Available Colours</div>
                    <div className="flex flex-wrap gap-2">
                      {publicProduct.colors.map((color) => (
                        <span
                          key={color.id}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {color.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hi, I'm interested in "${publicProduct.name}". Can you provide more details?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-4 rounded-xl bg-green-500 hover:bg-green-600 transition text-white font-semibold shadow-lg"
              >
                Contact on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
