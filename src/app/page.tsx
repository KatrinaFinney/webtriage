import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import CallToAction from './components/CallToAction';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import VantaBackground from './components/VantaBackground';

export default function Home() {
  return (
    <>
      <VantaBackground />
      <HeroSection />
      <ServicesSection />
      <PricingSection />
      <CallToAction />
      <Footer />
    </>
  );
}
