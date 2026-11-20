import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'FacturCMR – Șofer' };

// Aplicația șoferului: mobile-first, lățime maximă de telefon, mod întunecat automat.
export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="driver-app min-h-screen">
      <div className="mx-auto min-h-screen max-w-md bg-surface">{children}</div>
    </div>
  );
}
