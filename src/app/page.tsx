import VantaBackground from './components/VantaBackground';
import HeroSection from './components/HeroSection';
import PricingSection from './components/PricingSection';
import ServicesSection from './components/ServicesSection';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <VantaBackground>
      <HeroSection />
      <main>
        <PricingSection />
        <ServicesSection />
        <CallToAction />
        <Footer />
      </main>
    </VantaBackground>
  );
}
