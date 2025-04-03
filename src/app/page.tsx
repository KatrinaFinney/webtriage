import VantaBackground from './components/VantaBackground';
import HeroSection from './components/HeroSection';
import PricingSection from './components/PricingSection';
import ServicesSection from './components/ServicesSection';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import FaqSection from './components/FaqSection';
import TrustSection from './components/TrustSection';

export default function HomePage() {
  return (
    <VantaBackground>
      <HeroSection />
      <main>
        <PricingSection />
        <ServicesSection />
        <TrustSection />
        <FaqSection />
        <CallToAction />
        <Footer />
      </main>
    </VantaBackground>
  );
}
