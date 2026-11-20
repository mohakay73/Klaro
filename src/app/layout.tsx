import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Klaro — Automatiserad Skattebuffert & Bokföring för svenska frilansare & småbolag',
  description: 'Realtidsberäkning av moms, F-skatt och säkert disponibelt belopp för Enskild Firma och Aktiebolag. Noll skattechocker.',
  keywords: ['skattebuffert', 'momsberäkning', 'enskild firma', 'aktiebolag', 'fakturering', 'bokföring', 'skatteverket', 'open banking', 'psd2', 'kvitto'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Klaro',
  },
  applicationName: 'Klaro',
};

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-[#f7f4ee] text-[#1c1917] antialiased selection:bg-amber-200 selection:text-[#1c1917]">
        {children}
      </body>
    </html>
  );
}
