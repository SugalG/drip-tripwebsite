import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
const ContactSection = () => {
  const whatsappNumber = "+1234567890";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;
  return <section id="contact" className="py-24 bg-muted/30">
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
            ​ <span className="gradient-text">Visit Our Store</span>
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
                    State 12345, Country
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
                  <p className="text-muted-foreground">Sunday - Friday: 11:00 AM - 7:00 PM
Saturday - 12:00 AM - 6:00 PM<br />
                    Saturday - Sunday: 11:00 AM - 8:00 PM
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
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s" width="100%" height="100%" style={{
            border: 0,
            minHeight: "400px"
          }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Store Location" />
          </motion.div>
        </div>
      </div>
    </section>;
};
export default ContactSection;