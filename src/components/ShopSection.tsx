import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import { Product } from "@/types/product";

const categories = ["Disposables", "Devices", "E-Liquids", "Accessories", "All"];

const ShopSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: api.getProducts,
  });

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) =>
          activeCategory === "Devices"
            ? p.category === "Devices" || p.category === "Mods"
            : p.category === activeCategory
        );

  return (
    <section id="shop" className="py-24 bg-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-display font-bold mb-4 md:text-6xl bg-primary-foreground text-accent">
            <span className="gradient-text text-6xl">Our Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide selection of premium vape products. Quality and satisfaction
            guaranteed with every purchase.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeCategory === category
                  ? "gradient-button text-primary-foreground shadow-button"
                  : "bg-card border border-border text-foreground hover:border-primary"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {isLoading ? (
          <p className="text-center text-lg">Loading products...</p>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                category={product.category}
                description={product.description}
                images={product.imageUrl}
                coverIndex={product.coverIndex}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ShopSection;
