import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebTriage.pro',
  description: 'Urgent care for broken websites.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
