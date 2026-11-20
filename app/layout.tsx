import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
import { ThemeSync } from '@/components/ThemeToggle';
import { themeScript } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'FacturCMR – eCMR pentru transportatori',
  description: 'eCMR completat și semnat pe telefon. De la livrare la factură, în aceeași zi.',
  manifest: '/manifest.webmanifest',
};

// Bara de sus e bleumarin în ambele teme, deci bara browserului rămâne bleumarin.
export const viewport: Viewport = {
  themeColor: '#0F2A4A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: scriptul din <head> pune clasa `dark` înainte ca React să preia pagina.
    <html lang="ro" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Fără „clipire”: tema e aplicată înainte de prima afișare (vezi ghidul Next „Preventing Flash”). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
