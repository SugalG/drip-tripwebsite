import { motion } from "framer-motion";
import { Shield, Award, Heart, Clock } from "lucide-react";
const features = [{
  icon: Shield,
  title: "Quality Assured",
  description: "All products are authentic and sourced from authorized distributors."
}, {
  icon: Award,
  title: "Premium Selection",
  description: "Curated collection of the finest vape products and accessories."
}, {
  icon: Heart,
  title: "Customer First",
  description: "Dedicated support and personalized recommendations for every customer."
}, {
  icon: Clock,
  title: "Fast Service",
  description: "Quick response times and efficient order processing."
}];
const AboutSection = () => {
  return <section id="about" className="py-24 bg-primary-foreground">
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
      }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            About <span className="gradient-text">Us</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The trusted destination for premium vaping products. We're committed to providing the best experience for our valued customers Since 2022</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => <motion.div key={feature.title} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} className="p-6 rounded-2xl gradient-card shadow-card border border-border/50 group hover:shadow-soft transition-all duration-300">
              <motion.div className="w-14 h-14 rounded-xl gradient-button flex items-center justify-center mb-4 shadow-button" whileHover={{
            scale: 1.1,
            rotate: 5
          }}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:gradient-text transition-all">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>)}
        </div>

        
      </div>
    </section>;
};
export default AboutSection;