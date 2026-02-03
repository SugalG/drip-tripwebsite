import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import vape1 from "@/assets/vape-1.png";
import vape2 from "@/assets/vape-2.png";
import vape3 from "@/assets/vape-3.png";
import vapeMod1 from "@/assets/vape-mod-1.png";
import vapeMod2 from "@/assets/vape-mod-2.png";
import eliquid1 from "@/assets/eliquid-1.png";
import eliquid2 from "@/assets/eliquid-2.png";
import accessory1 from "@/assets/accessory-1.png";
import accessory2 from "@/assets/accessory-2.png";
const categories = ["Disposables", "Mods", "E-Liquids", "Accessories", "All"];
const products = [{
  id: 1,
  name: "Cloud Master Pro",
  price: 4999,
  category: "Disposables",
  description: "Premium disposable vape with 5000 puffs and rich flavor.",
  image: vape1
}, {
  id: 2,
  name: "Vapor King X2",
  price: 7999,
  category: "Mods",
  description: "Advanced mod with temperature control and long battery life.",
  image: vapeMod1
}, {
  id: 3,
  name: "Blue Razz Ice",
  price: 2499,
  category: "E-Liquids",
  description: "Refreshing blue raspberry flavor with cooling menthol finish.",
  image: eliquid1
}, {
  id: 4,
  name: "Mega Puff 8000",
  price: 3499,
  category: "Disposables",
  description: "Extended puff count disposable with adjustable airflow.",
  image: vape2
}, {
  id: 5,
  name: "Pod System Elite",
  price: 5999,
  category: "Mods",
  description: "Compact pod system perfect for MTL and DTL vaping.",
  image: vapeMod2
}, {
  id: 6,
  name: "Tropical Mango",
  price: 2299,
  category: "E-Liquids",
  description: "Sweet and juicy mango flavor for all-day vaping.",
  image: eliquid2
}, {
  id: 7,
  name: "Replacement Coils 5pk",
  price: 1999,
  category: "Accessories",
  description: "Premium mesh coils for enhanced flavor and vapor.",
  image: accessory1
}, {
  id: 8,
  name: "Carrying Case",
  price: 1499,
  category: "Accessories",
  description: "Protective case with compartments for vape and accessories.",
  image: accessory2
}, {
  id: 9,
  name: "Crystal Clear 6000",
  price: 3999,
  category: "Disposables",
  description: "Crystal-clear body with LED indicator and smooth draw.",
  image: vape3
}];
const ShopSection = () => {
  const [activeCategory, setActiveCategory] = useState("Disposables");
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);
  return <section id="shop" className="py-24 bg-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4 md:text-6xl bg-primary-foreground text-accent">
            ​ <span className="gradient-text text-6xl">Our Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide selection of premium vape products. Quality and
            satisfaction guaranteed with every purchase.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => <motion.button key={category} onClick={() => setActiveCategory(category)} className={`px-6 py-2 rounded-full font-medium transition-all ${activeCategory === category ? "gradient-button text-primary-foreground shadow-button" : "bg-card border border-border text-foreground hover:border-primary"}`} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
              {category}
            </motion.button>)}
        </motion.div>

        {/* Products Grid */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => <ProductCard key={product.id} {...product} />)}
        </motion.div>
      </div>
    </section>;
};
export default ShopSection;