import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images?: string[];
  coverIndex?: number;
  flavors?: string[];
}

const formatNPR = (price: number) => `NPR ${price.toLocaleString("en-NP")}`;

const ProductCard = ({
  id,
  name,
  price,
  category,
  description,
  images = [],
  coverIndex = 0,
  flavors = [],
}: ProductCardProps) => {
  const navigate = useNavigate();
  const coverImage = images?.[coverIndex] || images?.[0];

  const goToDetails = () => navigate(`/product/${id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group p-6 rounded-2xl gradient-card shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 cursor-pointer"
      whileHover={{ y: -5 }}
      onClick={goToDetails}
    >
      <div className="aspect-square rounded-xl bg-gradient-to-br from-vape-blue/10 to-vape-pink/10 mb-4 flex items-center justify-center overflow-hidden">
        {coverImage ? (
          <motion.img
            src={coverImage}
            alt={name}
            className="w-full h-full object-contain p-4"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        ) : (
          <motion.div className="text-6xl">💨</motion.div>
        )}
      </div>

      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">
        {category}
      </span>

      <h3 className="text-lg font-semibold mb-2 group-hover:gradient-text transition-all">
        {name}
      </h3>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {description}
      </p>

      {flavors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {flavors.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-1 rounded-full bg-card border border-border text-foreground/80"
            >
              {f}
            </span>
          ))}
          {flavors.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-card border border-border text-foreground/80">
              +{flavors.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold gradient-text">{formatNPR(price)}</span>

        <motion.button
          className="px-4 py-2 rounded-full gradient-button text-primary-foreground text-sm font-medium shadow-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            goToDetails();
          }}
        >
          View
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;