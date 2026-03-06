import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface Flavor {
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
  flavors: Flavor[];
}

const API_URL = import.meta.env.VITE_API_URL;

const formatNPR = (price: number) => `NPR ${price.toLocaleString("en-NP")}`;

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API_URL}/api/products/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch product");
        return data;
      })
      .then((data: Product) => {
        setProduct(data);
        const cover =
          data.imageUrl?.[data.coverIndex ?? 0] || data.imageUrl?.[0] || "";
        setActiveImg(cover);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  const images = useMemo(() => product?.imageUrl || [], [product]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero px-4 py-10">
        <div className="container mx-auto max-w-6xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
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
                  alt={product.name}
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
              {product.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              {product.name}
            </h1>

            <div className="text-2xl font-bold gradient-text mb-5">
              {formatNPR(product.price)}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {product.flavors?.length > 0 && (
              <>
                <div className="font-semibold mb-2">Available Flavors</div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.flavors.map((f) => (
                    <span
                      key={f.id}
                      className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-8">
              <a
                href={`https://wa.me/9779828037569?text=${encodeURIComponent(
                  `Hi, I'm interested in "${product.name}". Can you provide more details?`
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