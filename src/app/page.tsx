import VantaBackground from "./components/VantaBackground";
import FadeSection from "./components/FadeSection";

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
      {/* 🌌 Hero: Vanta Globe with badge */}
      <VantaBackground
        color={0x4e8fff}
        backgroundColor={0x0a1128}
        points={14}
        size={1.3}
      >
        <HeroSection />
      </VantaBackground>

      {/* 🔥 Animated background for rest of page */}
      <main className="animated-bg">
        <FadeSection><PricingSection /></FadeSection>
        <FadeSection><ServicesSection /></FadeSection>
        <FadeSection><TrustSection /></FadeSection>
        <FadeSection><FaqSection /></FadeSection>
        <FadeSection><CallToAction /></FadeSection>
        <FadeSection><Footer /></FadeSection>
      </main>
    </>
  );
}
