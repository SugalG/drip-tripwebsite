import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  const scrollToShop = () => {
    const element = document.querySelector("#shop");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="welcome" className="h-[70vh] gradient-hero flex items-center justify-center relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-vape-blue/30 blur-3xl" 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }} 
          transition={{
            duration: 4,
            repeat: Infinity
          }} 
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-vape-pink/40 blur-3xl" 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.9, 0.6]
          }} 
          transition={{
            duration: 5,
            repeat: Infinity
          }} 
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" 
          animate={{
            rotate: 360
          }} 
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }} 
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <img 
            src={logo} 
            alt="Drip & Trip - The Puff Club" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }} 
          className="text-4xl md:text-5xl font-display font-bold mb-6"
        >
          Elevate Your
          <br />
          <span className="gradient-text">Vaping Experience</span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.6 }} 
          className="flex flex-col gap-3 items-center justify-center sm:flex-row"
        >
          <motion.button 
            onClick={scrollToShop} 
            className="px-8 py-4 rounded-full gradient-button text-primary-foreground font-semibold shadow-button" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            Browse Products
          </motion.button>
          <motion.a 
            href="#about" 
            onClick={e => {
              e.preventDefault();
              document.querySelector("#about")?.scrollIntoView({
                behavior: "smooth"
              });
            }} 
            className="px-8 py-4 rounded-full bg-card/80 backdrop-blur-sm text-foreground font-semibold shadow-soft border border-border" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
