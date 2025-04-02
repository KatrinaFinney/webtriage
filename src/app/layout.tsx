import './globals.css';
import { spaceGrotesk, plexMono } from './fonts';

export const metadata = {
  title: 'WebTriage.pro',
  description: 'Urgent care for websites. Calm, fast, precise help when your site needs it most.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
