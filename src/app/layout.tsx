import './globals.css';
import { spaceGrotesk, plexMono } from './fonts';
import Head from 'next/head';




export const metadata = {
  title: 'WebTriage.pro',
  description: 'Emergency care for broken, slow, or unreliable websites.',
  keywords: 'website repair, emergency web support, broken website fix, web triage, site down help',
  authors: [
    { name: 'Katrina Finney', url: 'https://github.com/KatrinaFinney' },
    { name: 'WebTriage Team', url: 'https://webtriage.pro' },
  ],
  openGraph: {
    title: 'WebTriage.pro',
    description: 'Emergency care for broken, slow, or unreliable websites.',
    url: 'https://webtriage.pro',
    siteName: 'WebTriage.pro',
    type: 'website',
  },
  metadataBase: new URL('https://webtriage.pro'),
  icons: {
    icon: '/favicon.ico',
  },
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
<Head>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
</Head>
      <body>{children}</body>
    </html>
  );
}
