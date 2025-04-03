import VantaBackground from "./components/VantaBackground";
import HeroSection from "./components/HeroSection";
import PricingSection from "./components/PricingSection";
import ServicesSection from "./components/ServicesSection";
import TrustSection from "./components/TrustSection";
import FaqSection from "./components/FaqSection";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
      {/* 🌌 Hero Section with Vanta background */}
      <VantaBackground
        color={0x4e8fff}
        backgroundColor={0x0a1128}
        points={14}
        size={1.3}
      >
        <HeroSection />
      </VantaBackground>
      

      {/* 🔷 Remaining site content — clean, elegant */}
      <main style={{ backgroundColor: "#0a1128" }}>
        <PricingSection />
        <ServicesSection />
        <TrustSection />
        <FaqSection />
        <CallToAction />
        <Footer />
      </main>
    </>
  );
}
