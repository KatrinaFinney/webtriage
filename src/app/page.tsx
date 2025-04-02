import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import CallToAction from './components/CallToAction';
import PricingSection from './components/PricingSection';

import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PricingSection />
      <CallToAction />
      <Footer />
    </>
  );
}
