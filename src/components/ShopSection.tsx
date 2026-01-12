import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

const categories = ["All", "Disposables", "Mods", "E-Liquids", "Accessories"];

const products = [
  {
    id: 1,
    name: "Cloud Master Pro",
    price: 49.99,
    category: "Disposables",
    description: "Premium disposable vape with 5000 puffs and rich flavor.",
  },
  {
    id: 2,
    name: "Vapor King X2",
    price: 79.99,
    category: "Mods",
    description: "Advanced mod with temperature control and long battery life.",
  },
  {
    id: 3,
    name: "Blue Razz Ice",
    price: 24.99,
    category: "E-Liquids",
    description: "Refreshing blue raspberry flavor with cooling menthol finish.",
  },
  {
    id: 4,
    name: "Mega Puff 8000",
    price: 34.99,
    category: "Disposables",
    description: "Extended puff count disposable with adjustable airflow.",
  },
  {
    id: 5,
    name: "Pod System Elite",
    price: 59.99,
    category: "Mods",
    description: "Compact pod system perfect for MTL and DTL vaping.",
  },
  {
    id: 6,
    name: "Tropical Mango",
    price: 22.99,
    category: "E-Liquids",
    description: "Sweet and juicy mango flavor for all-day vaping.",
  },
  {
    id: 7,
    name: "Replacement Coils 5pk",
    price: 19.99,
    category: "Accessories",
    description: "Premium mesh coils for enhanced flavor and vapor.",
  },
  {
    id: 8,
    name: "Carrying Case",
    price: 14.99,
    category: "Accessories",
    description: "Protective case with compartments for vape and accessories.",
  },
];

const ShopSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="shop" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Our <span className="gradient-text">Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide selection of premium vape products. Quality and
            satisfaction guaranteed with every purchase.
          </p>
        </motion.div>

        {/* Category Filters */}
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

        {/* Products Grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ShopSection;
