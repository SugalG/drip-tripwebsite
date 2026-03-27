import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
const ContactSection = () => {
  const whatsappNumber = "9779828037561";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;
  return <section id="contact" className="py-24 bg-primary-foreground">
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
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
          <span className="gradient-text">Visit Our Store</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Come visit us or reach out through any of our channels. We're always
          happy to help you find the perfect product.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <motion.div initial={{
          opacity: 0,
          x: -30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="space-y-6">
          <div className="p-6 rounded-2xl gradient-card shadow-card border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center shadow-button flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Address</h3>
                <p className="text-muted-foreground">Kupondole, Lalitpur

                  <br />
                  Nepal
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl gradient-card shadow-card border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center shadow-button flex-shrink-0">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Store Hours</h3>
                <p className="text-muted-foreground">Sunday - Friday: 11:00 AM - 7:00 PM <br/>
                  Saturday - 12:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl gradient-card shadow-card border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center shadow-button flex-shrink-0">
                <Phone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Phone</h3>
                <p className="text-muted-foreground">+977 9828037561 | +977 9828037569</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl gradient-card shadow-card border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center shadow-button flex-shrink-0">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground">driptandtrip@gmail.com</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <motion.a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-green-500 text-white font-semibold shadow-lg hover:bg-green-600 transition-colors" whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
            <MessageCircle className="w-6 h-6" />
            Chat with us on WhatsApp
          </motion.a>
        </motion.div>

        {/* Map */}
        <motion.div initial={{
          opacity: 0,
          x: 30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="rounded-2xl overflow-hidden shadow-card border border-border/50 h-full min-h-[400px]">
          <iframe
            src="https://maps.google.com/maps?q=27.6882916,85.3162569&z=18&output=embed"
            width="100%"
            height="100%"
            style={{
              border: 0,
              minHeight: "400px"
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Drip And Trip | Ultimate Vape Store"
          />
        </motion.div>
      </div>
    </div>
  </section>;
};
export default ContactSection;