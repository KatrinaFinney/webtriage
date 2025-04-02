import VantaBackground from './components/VantaBackground';
import HeroSection from './components/HeroSection';
import PricingSection from './components/PricingSection';
import CallToAction from './components/CallToAction';
import ServicesSection from './components/ServicesSection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <VantaBackground>
      <HeroSection />
      <main>
      <ServicesSection />
        <PricingSection />
        <CallToAction />
        <Footer />
      </main>
    </VantaBackground>
  );
}
