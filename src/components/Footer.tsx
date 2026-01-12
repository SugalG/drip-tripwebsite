import { motion } from "framer-motion";
const Footer = () => {
  return <footer className="py-12 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center md:text-left">
            <h3 className="text-2xl font-display font-bold gradient-text mb-2">
              ​DRIP AND TRIP  
            </h3>
            <p className="text-sm text-muted-foreground">The Ultimate Vape Store</p>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="flex gap-6">
            <a href="#welcome" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={e => {
            e.preventDefault();
            document.querySelector("#welcome")?.scrollIntoView({
              behavior: "smooth"
            });
          }}>
              Home
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={e => {
            e.preventDefault();
            document.querySelector("#about")?.scrollIntoView({
              behavior: "smooth"
            });
          }}>
              About
            </a>
            <a href="#shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={e => {
            e.preventDefault();
            document.querySelector("#shop")?.scrollIntoView({
              behavior: "smooth"
            });
          }}>
              Shop
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={e => {
            e.preventDefault();
            document.querySelector("#contact")?.scrollIntoView({
              behavior: "smooth"
            });
          }}>
              Contact
            </a>
          </motion.div>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }} className="text-sm text-muted-foreground">© 2022 Drip And Trip. All rights reserved.</motion.p>
        </div>
      </div>
    </footer>;
};
export default Footer;