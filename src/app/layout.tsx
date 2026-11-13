import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Klaro — Automatiserad Skattebuffert & Bokföring för svenska frilansare & småbolag',
  description: 'Realtidsberäkning av moms, F-skatt och säkert disponibelt belopp för Enskild Firma och Aktiebolag. Noll skattechocker.',
  keywords: ['skattebuffert', 'momsberäkning', 'enskild firma', 'aktiebolag', 'fakturering', 'bokföring', 'skatteverket', 'open banking', 'psd2'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-[#f8f7f4] text-zinc-900 antialiased selection:bg-zinc-200">
        {children}
      </body>
    </html>
  );
}
