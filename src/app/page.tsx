import VantaBackgroundParallax from "./components/VantaBackgroundParallax";
import VantaBackground from "./components/VantaBackground";
import FadeSection from "./components/FadeSection";
import SectionDivider from "./components/SectionDivider";

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
      {/* 🎬 Hero: Scroll-reactive Vanta for impact */}
      <VantaBackgroundParallax color={0x4e8fff} points={14} size={1.5}>
        <FadeSection delay={0}>
          <HeroSection />
        </FadeSection>
      </VantaBackgroundParallax>

      <SectionDivider />

      {/* 💳 Pricing Section (static, clean) */}
      <FadeSection>
        <PricingSection />
      </FadeSection>

      {/* 🛠️ Services: Calm globe behind structured content */}
      <VantaBackground color={0xffcc00} points={16} size={2.0}>
        <FadeSection>
          <ServicesSection />
        </FadeSection>
      </VantaBackground>

      <SectionDivider />

      {/* ✅ Trust Section: No background for clarity */}
      <FadeSection>
        <TrustSection />
      </FadeSection>

      {/* ❓ FAQ Section: Keep it simple */}
      <FadeSection>
        <FaqSection />
      </FadeSection>

      {/* 🚀 CTA: Parallax globe to re-energize */}
      <VantaBackgroundParallax color={0xff4488} points={20} size={1.8}>
        <FadeSection>
          <CallToAction />
        </FadeSection>
      </VantaBackgroundParallax>

      <SectionDivider />

      {/* 📞 Footer: Neutral, clean finish */}
      <FadeSection>
        <Footer />
      </FadeSection>
    </>
  );
}
