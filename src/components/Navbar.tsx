import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
const navItems = [{
  label: "Welcome",
  href: "#welcome"
}, {
  label: "About Us",
  href: "#about"
}, {
  label: "Shop Visit",
  href: "#contact"
}];
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };
  return <motion.nav initial={{
    y: -100
  }} animate={{
    y: 0
  }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-card/95 backdrop-blur-md shadow-card" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 py-4 border-0 border-primary-foreground">
        <div className="flex items-center justify-between">
          <motion.a href="#welcome" onClick={e => {
          e.preventDefault();
          scrollToSection("#welcome");
        }} className="hidden md:block text-2xl font-display font-bold gradient-text" whileHover={{
          scale: 1.05
        }}>
            ​DRIP AND TRIP
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => <motion.a key={item.label} href={item.href} onClick={e => {
            e.preventDefault();
            scrollToSection(item.href);
          }} className="relative font-medium transition-colors text-vape-blue text-center shadow-none opacity-100 rounded-none" whileHover={{
            scale: 1.05
          }}>
                {item.label}
                <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-button" whileHover={{
              width: "100%"
            }} transition={{
              duration: 0.2
            }} />
              </motion.a>)}
       
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col gap-4 pt-4">
              {navItems.map(item => <a key={item.label} href={item.href} onClick={e => {
            e.preventDefault();
            scrollToSection(item.href);
          }} className="text-foreground/80 hover:text-foreground font-medium transition-colors">
                  {item.label}
                </a>)}
             
            </div>
          </motion.div>}
      </div>
    </motion.nav>;
};
export default Navbar;