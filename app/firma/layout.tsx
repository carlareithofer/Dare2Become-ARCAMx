import type { Metadata } from 'next';
import { FirmSidebar } from '@/components/FirmSidebar';

export const metadata: Metadata = { title: 'FacturCMR – Dashboard firmă' };

// Dashboard-ul firmei: desktop, bară laterală bleumarin + conținut pe fundal deschis.
export default function FirmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <FirmSidebar />
      <main className="min-w-0 flex-1 px-8 py-7">{children}</main>
    </div>
  );
}
