import { motion } from "framer-motion";
import { Shield, Award, Heart, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Quality Assured",
    description: "All products are authentic and sourced from authorized distributors.",
  },
  {
    icon: Award,
    title: "Premium Selection",
    description: "Curated collection of the finest vape products and accessories.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Dedicated support and personalized recommendations for every customer.",
  },
  {
    icon: Clock,
    title: "Fast Service",
    description: "Quick response times and efficient order processing.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            About <span className="gradient-text">Us</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted destination for premium vaping products. We're committed
            to providing the best experience for our valued customers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-2xl gradient-card shadow-card border border-border/50 group hover:shadow-soft transition-all duration-300"
            >
              <motion.div
                className="w-14 h-14 rounded-xl gradient-button flex items-center justify-center mb-4 shadow-button"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:gradient-text transition-all">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-8 rounded-3xl gradient-card shadow-card border border-border/50"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-display font-bold mb-4">
                Why Choose <span className="gradient-text">VapeCloud</span>?
              </h3>
              <p className="text-muted-foreground mb-4">
                We're not just a vape store – we're a community of enthusiasts
                dedicated to providing the best products and experience. Our team
                carefully selects each product to ensure quality and satisfaction.
              </p>
              <p className="text-muted-foreground">
                With years of experience in the industry, we understand what vapers
                want and need. From starter kits to advanced mods, we've got
                everything covered.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-vape-blue/20 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="p-6 rounded-2xl bg-vape-pink/20 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="p-6 rounded-2xl bg-vape-pink/20 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Brands</div>
              </div>
              <div className="p-6 rounded-2xl bg-vape-blue/20 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">5★</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
