/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VantaBackground from './components/VantaBackground';
import HeroSection from './components/HeroSection';
import PricingSection from './components/PricingSection';
import ServicesSection from './components/ServicesSection';
import TrustSection from './components/TrustSection';
import FaqSection from './components/FaqSection';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import Modal from './components/Modal';

export default function HomePage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>();

  // Grab current hostname for /scan?site=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  /*const handleSelectService = (service: string) => {
    if (service === 'Free Scan') {
      router.push(`/scan?site=${encodeURIComponent(domain)}`);
    } else {
      setSelectedService(service);
      setModalOpen(true);
    }
  }; */

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedService(undefined);
  };

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

      {/* Traveling red line divider */}
      <div className="travelingLine" />

      <main style={{ backgroundColor: '#0a1128' }}>

        <PricingSection />

        <div className="travelingLine" />

        <ServicesSection />

        <TrustSection />

        <FaqSection />

        <CallToAction />

        <div className="travelingLine" />

        <Footer />
      </main>

      {/* Modal for non‐scan services */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        selectedService={selectedService}
      />
    </>
  );
}
