"use client";

import VantaBackground from "./components/VantaBackground";
import HeroSection from "./components/HeroSection";
import PricingSection from "./components/PricingSection";
import ServicesSection from "./components/ServicesSection";
import TrustSection from "./components/TrustSection";
import FaqSection from "./components/FaqSection";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

/* 
  The traveling line component.
  Place it in ./components/TravelingLine.tsx if you prefer. 
*/
function TravelingLine() {
  return <div className="travelingLine" />;
}

export default function HomePage() {
  return (
    <>
      {/* Hero with Vanta background */}
      <VantaBackground
        color={0x4e8fff}
        backgroundColor={0x0a1128}
        points={14}
        size={1.3}
      >
        <HeroSection />
      </VantaBackground>

      {/* The traveling red line divider */}
      <TravelingLine />

      {/* Main site content */}
      <main style={{ backgroundColor: "#0a1128" }}>
        <PricingSection />
        <TravelingLine />
        <ServicesSection />
        <TrustSection />
        <FaqSection />
        <CallToAction />
        <TravelingLine />
        <Footer />
      </main>
    </>
  );
}
