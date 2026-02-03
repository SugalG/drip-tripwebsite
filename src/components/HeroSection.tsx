import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.png";
const HeroSection = () => {
  const scrollToShop = () => {
    const element = document.querySelector("#shop");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section id="welcome" className="h-[70vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroBg})`
    }} />
      
      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.8
      }} className="mb-6">
          <img src={logo} alt="Drip & Trip - The Puff Club" className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl" />
        </motion.div>

        <motion.h1 initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="text-4xl md:text-5xl font-display font-bold mb-6 text-primary">
          Elevate Your
          <br />
          <span className="gradient-text">Vaping Experience</span>
        </motion.h1>

        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.6
      }} className="flex flex-col gap-3 items-center justify-center sm:flex-row">
          <motion.button onClick={scrollToShop} className="px-8 py-4 rounded-full gradient-button text-primary-foreground font-semibold shadow-button" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            Browse Products
          </motion.button>
          <motion.a href="#about" onClick={e => {
          e.preventDefault();
          document.querySelector("#about")?.scrollIntoView({
            behavior: "smooth"
          });
        }} className="px-8 py-4 rounded-full backdrop-blur-sm font-semibold shadow-soft border border-border text-muted bg-primary" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            Learn More
          </motion.a>
        </motion.div>
      </div>
    </section>;
};
export default HeroSection;