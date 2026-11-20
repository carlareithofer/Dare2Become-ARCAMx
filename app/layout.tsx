import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import './globals.css';

export const metadata: Metadata = {
  title: 'FacturCMR – eCMR pentru transportatori',
  description: 'eCMR completat și semnat pe telefon. De la livrare la factură, în aceeași zi.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0F2A4A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
