import { VantaEffectInstance } from './VantaEffect';

export {};

type VantaOptions = {
  el: HTMLDivElement;
  THREE: typeof import('three');
  color?: number;
  backgroundColor?: number;
  size?: number;
  points?: number;
  spacing?: number;
  maxDistance?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  scale?: number;
  scaleMobile?: number;
  minHeight?: number;
  minWidth?: number;
};

// Declare our Vanta and analytics globals
declare global {
  interface Window {
    VANTA: {
      GLOBE: (options: VantaOptions) => VantaEffectInstance;
      NET: (options: VantaOptions) => VantaEffectInstance;
    };
    gtag?: (...args: [string, string, Record<string, unknown>]) => void;
  }
}

// Declare un‑typed modules so TS stops complaining
declare module 'chrome-aws-lambda';
declare module 'lighthouse';
