import './globals.css';
import type { ReactNode } from 'react';
import VantaBackground from './components/VantaBackground';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VantaBackground />
        {children}
      </body>
    </html>
  );
}
