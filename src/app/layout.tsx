import './globals.css';
import type { ReactNode } from 'react';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata = {
  title: 'WebTriage.dev',
  description: 'Clean, fast, precise support for websites.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load Vanta globally once to improve speed */}
        <script
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"
          async
        />
      </head>
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
