'use client';

import React, { createContext, useContext, useState } from 'react';
import Modal from './Modal';

type ModalContextValue = {
  open: (service: string) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [service, setService] = useState<string | undefined>(undefined);

  const open = (svc: string) => {
    setService(svc);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={close}
        selectedService={service}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be inside a ModalProvider');
  return ctx;
}
