import { motion } from "framer-motion";

interface ProductCardProps {
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
}

const ProductCard = ({ name, price, category, description }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group p-6 rounded-2xl gradient-card shadow-card border border-border/50 hover:shadow-soft transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="aspect-square rounded-xl bg-gradient-to-br from-vape-blue/20 to-vape-pink/20 mb-4 flex items-center justify-center overflow-hidden">
        <motion.div
          className="text-6xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          💨
        </motion.div>
      </div>
      
      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">
        {category}
      </span>
      
      <h3 className="text-lg font-semibold mb-2 group-hover:gradient-text transition-all">
        {name}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold gradient-text">
          ${price.toFixed(2)}
        </span>
        <motion.button
          className="px-4 py-2 rounded-full gradient-button text-primary-foreground text-sm font-medium shadow-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
