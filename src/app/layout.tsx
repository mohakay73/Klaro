import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Klaro — Svensk Frilans- & Skattebuffert (Enskild Firma & Småbolag)',
  description: 'Realtidsberäkning av moms, preliminärskatt och säkert disponibelt belopp för svenska frilansare.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
