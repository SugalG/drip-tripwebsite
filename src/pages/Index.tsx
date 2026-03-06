import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ShopSection from "@/components/ShopSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AgeVerificationModal from "@/components/AgeVerficationModal";

const Index = () => {
  const [ageVerified, setAgeVerified] = useState(false);

  return (
    <div className="min-h-screen">
      {!ageVerified && (
        <AgeVerificationModal onVerified={() => setAgeVerified(true)} />
      )}

      <Navbar />
      <HeroSection />
      <ShopSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;