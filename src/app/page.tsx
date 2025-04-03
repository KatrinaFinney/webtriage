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
    <VantaBackground
      color={0x3b82f6}
      backgroundColor={0x0a1128}
      points={10}
      size={1.3}
    >
      <main>
        <HeroSection />
        <FadeSection><PricingSection /></FadeSection>
        <FadeSection><ServicesSection /></FadeSection>
        <FadeSection><TrustSection /></FadeSection>
        <FadeSection><FaqSection /></FadeSection>
        <FadeSection><CallToAction /></FadeSection>
        <FadeSection><Footer /></FadeSection>
      </main>
    </VantaBackground>
  );
}
