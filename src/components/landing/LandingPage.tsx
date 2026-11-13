'use client';

import React, { useState } from 'react';
import { formatSEK } from '@/lib/utils';
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Landmark, 
  Receipt, 
  FileText, 
  Building2, 
  Wallet, 
  Clock,
  ChevronDown,
  Layers,
  Sparkles,
  Lock,
  Smartphone,
  Eye,
  CheckCircle2,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDemoTour: () => void;
}

export function LandingPage({ onEnterApp, onOpenDemoTour }: LandingPageProps) {
  // Interactive Simulator State
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(75000);
  const [companyType, setCompanyType] = useState<'enskild_firma' | 'aktiebolag'>('enskild_firma');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Exact Swedish Tax Calculations
  // 25% moms on net revenue = 20% of gross invoice amount
  const vatAmount = Math.round(monthlyRevenue * 0.20);
  const netRevenue = monthlyRevenue - vatAmount;
  
  // Tax buffer calculations
  // Enskild Firma: Egenavgifter + preliminärskatt (~43% på vinst efter 25% schablonavdrag)
  // Aktiebolag: Bolagsskatt (20.6% på årsvinst)
  const taxBuffer = companyType === 'enskild_firma' 
    ? Math.round(netRevenue * 0.43)
    : Math.round(netRevenue * 0.206);

  const safeToSpend = netRevenue - taxBuffer;
  const safePct = Math.round((safeToSpend / monthlyRevenue) * 100);
  const vatPct = Math.round((vatAmount / monthlyRevenue) * 100);
  const taxPct = 100 - safePct - vatPct;

  const faqs = [
    {
      q: 'Hur vet Klaro hur mycket jag säkert kan ta ut?',
      a: 'Varje gång en intäkt eller kostnad registreras beräknar Klaro den exakta momsskulden (utgående minus avdragsgill ingående moms) samt preliminär inkomstskatt och egenavgifter. Det belopp som återstår är ditt garanterat disponibla överskott. Du vet alltid vad du kan föra över till ditt privata bankkonto utan att riskera kvarskatt.',
    },
    {
      q: 'Fungerar Klaro för både Enskild Firma och Aktiebolag?',
      a: 'Ja. Du växlar bolagsform med ett klick. För Enskild Firma beräknar Klaro schablonavdrag (25%), egenavgifter (28,97%) samt kommunalskatt. För Aktiebolag reserveras bolagsskatt (20,6%) och systemet separerar bolagets medel från privata ägarutlägg.',
    },
    {
      q: 'Ersätter Klaro min redovisningskonsult?',
      a: 'Klaro sköter den dagliga överblicken och gör att du slipper göra misstag under året. När det är dags för bokslut exporterar du en komplett SIE-4-fil med ett klick. Din redovisningsbyrå eller revisor läser in den i Fortnox, Visma eller Capego på några sekunder.',
    },
    {
      q: 'Uppfyller kvitton kraven i Bokföringslagen?',
      a: 'Ja, alla underlag sparas digitalt i enlighet med 7 kap. Bokföringslagen. Klaro mappar automatiskt affärshändelser mot BAS-kontoplanen och håller isär 25%, 12% och 6% moms med full revisionshistorik.',
    },
    {
      q: 'Hur ansluter jag min bank?',
      a: 'Klaro ansluter via Finansinspektionen-godkända Open Banking API:er (PSD2) med Mobilt BankID till Handelsbanken, Swedbank, SEB, Nordea, Danske Bank med flera. Inga lösenord eller kortuppgifter sparas hos oss.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1917] font-sans selection:bg-amber-200 selection:text-[#1c1917] antialiased">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#f7f4ee]/85 backdrop-blur-md border-b border-[#e7e2d7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Mark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917] flex items-center justify-center text-[#d97706] font-black text-sm shadow-xs">
              K
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#1c1917] block leading-tight">
                Klaro
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-stone-600">
            <a href="#kalkylator" className="hover:text-[#1c1917] transition">Skattekalkylator</a>
            <a href="#funktioner" className="hover:text-[#1c1917] transition">Funktioner</a>
            <a href="#jamforelse" className="hover:text-[#1c1917] transition">Varför Klaro</a>
            <a href="#priser" className="hover:text-[#1c1917] transition">Priser</a>
            <a href="#faq" className="hover:text-[#1c1917] transition">Frågor & svar</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDemoTour}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-[#1c1917] bg-white/70 hover:bg-white border border-[#e7e2d7] transition cursor-pointer shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Interaktiv demo</span>
            </button>

            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1c1917] hover:bg-[#292524] shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>Öppna Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#f59e0b]" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section: Refined Scandinavian Editorial */}
      <section className="pt-14 pb-20 sm:pt-20 sm:pb-26">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e7e2d7] shadow-2xs text-xs font-medium text-stone-800">
              <span className="w-2 h-2 rounded-full bg-[#d97706]" />
              <span>Skattebuffert i realtid för svenska egenföretagare</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1c1917] leading-[1.12]">
              Ha full koll på skatten. <br />
              <span className="text-[#b45309] underline decoration-[#d97706]/40 underline-offset-8">
                Innan den ska betalas.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Klaro separerar moms och F-skatt automatiskt vid varje kundinbetalning. 
              Du ser alltid exakt vad du säkert kan ta ut i lön – utan kvarskattchock i maj.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-sm shadow-sm hover:shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Testa kostnadsfritt i webbläsaren</span>
                <ArrowRight className="w-4 h-4 text-[#f59e0b]" />
              </button>

              <button
                onClick={onOpenDemoTour}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-[#e7e2d7] text-[#1c1917] font-medium text-sm shadow-2xs transition active:scale-95 cursor-pointer"
              >
                Se 60-sekunders rundtur
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#15803d]" />
                Bokföringslagen 7 kap.
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#15803d]" />
                Skattekontot BG 5050-1055
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#15803d]" />
                Öppen bankkoppling (PSD2)
              </span>
            </div>

          </div>

          {/* 3. The Interactive Cockpit Preview (Option 2: Stockholm Ochre) */}
          <div id="kalkylator" className="mt-14 max-w-4xl mx-auto">
            
            <div className="bg-white rounded-3xl border border-[#e7e2d7] p-6 sm:p-9 shadow-[0_16px_40px_rgba(28,25,23,0.04)] space-y-7">
              
              {/* Header inside card: Company switcher & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e7e2d7]/80">
                <div>
                  <h3 className="text-lg font-bold text-[#1c1917]">
                    Interaktiv skattebuffert
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Dra i reglaget för att simulera din månatliga fakturering.
                  </p>
                </div>

                {/* Company Type Tabs */}
                <div className="flex items-center rounded-xl bg-[#f4efe6] p-1 text-xs font-semibold self-start sm:self-auto border border-[#e7e2d7]">
                  <button
                    type="button"
                    onClick={() => setCompanyType('enskild_firma')}
                    className={`px-3.5 py-1.5 rounded-lg transition ${
                      companyType === 'enskild_firma'
                        ? 'bg-white text-[#1c1917] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-[#1c1917]'
                    }`}
                  >
                    Enskild Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyType('aktiebolag')}
                    className={`px-3.5 py-1.5 rounded-lg transition ${
                      companyType === 'aktiebolag'
                        ? 'bg-white text-[#1c1917] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-[#1c1917]'
                    }`}
                  >
                    Aktiebolag (AB)
                  </button>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-stone-600">
                    Månatlig fakturering (inkl. 25% moms):
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1c1917] tabular-nums">
                    {formatSEK(monthlyRevenue)}
                  </span>
                </div>

                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="5000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-[#1c1917] h-2 bg-[#f4efe6] rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>20 000 kr</span>
                  <span>100 000 kr</span>
                  <span>200 000 kr</span>
                </div>
              </div>

              {/* Segmented Capital Bar */}
              <div className="space-y-2">
                <div className="h-3.5 rounded-xl overflow-hidden flex bg-[#f4efe6] shadow-inner">
                  <div
                    style={{ width: `${safePct}%` }}
                    className="bg-[#15803d] transition-all duration-300"
                    title={`Säkert överskott: ${safePct}%`}
                  />
                  <div
                    style={{ width: `${vatPct}%` }}
                    className="bg-[#d97706] transition-all duration-300"
                    title={`Moms: ${vatPct}%`}
                  />
                  <div
                    style={{ width: `${taxPct}%` }}
                    className="bg-[#57534e] transition-all duration-300"
                    title={`F-skatt / Bolagsskatt: ${taxPct}%`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#15803d]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#15803d]" />
                    <span>Säkert disponibelt ({safePct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#b45309]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" />
                    <span>Momsreserv ({vatPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-700">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#57534e]" />
                    <span>{companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt'} ({taxPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Calculated Result Cards (Option 2 Styling) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                
                {/* Safe To Spend */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-900 font-bold block">
                    Säkert att ta ut
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#15803d] tabular-nums">
                    {formatSEK(safeToSpend)}
                  </div>
                  <p className="text-xs text-emerald-800 leading-snug">
                    Dina pengar. Fria att föra över till privatkontot utan kvarskattechock.
                  </p>
                </div>

                {/* Moms */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-900 font-bold block">
                    Reserverad moms
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#b45309] tabular-nums">
                    {formatSEK(vatAmount)}
                  </div>
                  <p className="text-xs text-amber-800 leading-snug">
                    Ska in på Skattekontot vid deklarationen (Ruta 49).
                  </p>
                </div>

                {/* F-skatt */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block">
                    {companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt (20,6%)'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1c1917] tabular-nums">
                    {formatSEK(taxBuffer)}
                  </div>
                  <p className="text-xs text-stone-600 leading-snug">
                    Reserveras för kommunalskatt och sociala avgifter.
                  </p>
                </div>

              </div>

              {/* Direct Link into Cockpit */}
              <div className="pt-2 text-center">
                <button
                  onClick={onEnterApp}
                  className="text-xs font-semibold text-[#1c1917] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Öppna hela cockpiten med förifyllda fakturor och kvitton</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#d97706]" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. Swedish Banks Strip */}
      <section className="py-9 bg-white border-y border-[#e7e2d7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-[#1c1917] block">
                Säker Open Banking-koppling (PSD2)
              </span>
              <span className="text-xs text-stone-500">
                Logga in med Mobilt BankID. Godkänt av Finansinspektionen.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                Handelsbanken
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                Swedbank
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                SEB
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                Nordea
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                Danske Bank
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features / Value Bento Grid */}
      <section id="funktioner" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase font-bold text-[#d97706] tracking-wider block mb-2">
              Funktioner
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1c1917]">
              Allt du behöver för en lugn ekonomi
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              Klaro kopplar ihop bank, kvitton och kundfakturor så att du alltid vet hur företaget ligger till.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#e7e2d7] space-y-3 shadow-2xs hover:border-stone-400 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#d97706] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1c1917]">
                Realtidsbuffert mot kvarskatt
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Varje gång pengar kommer in på företagskontot beräknas exakt hur mycket som är moms och preliminärskatt. Du ser alltid ditt säkert disponibla belopp.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#e7e2d7] space-y-3 shadow-2xs hover:border-stone-400 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#d97706] flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1c1917]">
                Kvittoavläsning & BAS-konton
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fota kvittot eller vidarebefordra via e-post. Klaro läser ut 25%, 12% och 6% moms och konterar mot rätt BAS-konto (t.ex. 5420 IT-tjänster eller 5800 Resor).
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#e7e2d7] space-y-3 shadow-2xs hover:border-stone-400 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#d97706] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1c1917]">
                Godkända A4-kundfakturor
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Skapa snygga PDF-fakturor med Bankgiro, OCR-nummer och F-skattklausul på 30 sekunder. Momsen bokförs automatiskt i din buffert.
              </p>
            </div>

          </div>

          {/* Concrete Expense Example Box */}
          <div className="p-6 rounded-2xl bg-white border border-[#e7e2d7] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e7e2d7]">
              <span className="text-xs font-bold text-[#1c1917]">
                Hur ett kortköp hanteras i Klaro:
              </span>
              <span className="text-xs font-mono text-stone-500">
                Exempel: Kvitto från Webhallen (1 875 kr)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
                <span className="text-[10px] text-stone-500 font-mono block">1. Total köpesumma</span>
                <span className="font-bold text-[#1c1917] font-mono text-sm">1 875,00 kr</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Drages från bankkontot</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] text-emerald-900 font-mono block">2. Ingående moms (25%)</span>
                <span className="font-bold text-[#15803d] font-mono text-sm">+ 375,00 kr</span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">Minskar din momsskuld direkt</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
                <span className="text-[10px] text-stone-500 font-mono block">3. Nettokostnad</span>
                <span className="font-bold text-[#1c1917] font-mono text-sm">1 500,00 kr</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Konteras BAS 5420 IT-tjänster</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Comparison: Traditional Systems vs Klaro */}
      <section id="jamforelse" className="py-20 bg-white border-y border-[#e7e2d7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-[#d97706]">
              Jämförelse
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917]">
              Varför Klaro skiljer sig från traditionella program
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
              System som Fortnox och Visma är byggda för redovisningskonsulter som dokumenterar historik. Klaro är byggt för att du som företagare ska ha full kontroll i nuet.
            </p>
          </div>

          <div className="border border-[#e7e2d7] rounded-2xl overflow-hidden bg-white shadow-2xs divide-y divide-[#e7e2d7]">
            
            <div className="grid grid-cols-12 bg-[#f7f4ee] p-4 text-xs font-bold text-[#1c1917]">
              <div className="col-span-5">Funktion</div>
              <div className="col-span-3 text-stone-500">Traditionell programvara</div>
              <div className="col-span-4 text-[#15803d] font-bold">Klaro</div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-medium text-[#1c1917]">
                Realtidsbuffert mot kvarskatt
              </div>
              <div className="col-span-3 text-stone-400">
                Nej (visar endast banksaldo)
              </div>
              <div className="col-span-4 font-semibold text-[#15803d] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Räknas om vid varje köp</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-medium text-[#1c1917]">
                Disponibel lön (Safe-to-Spend)
              </div>
              <div className="col-span-3 text-stone-400">
                Saknas (måste räknas manuellt)
              </div>
              <div className="col-span-4 font-semibold text-[#15803d] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Alltid synligt i cockpiten</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-medium text-[#1c1917]">
                Automatisk kvitto- och momstolkning
              </div>
              <div className="col-span-3 text-stone-400">
                Ofta dyra tilläggsmoduler
              </div>
              <div className="col-span-4 font-semibold text-[#15803d] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Ingår som standard</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-medium text-[#1c1917]">
                Samarbete med revisor / redovisningsbyrå
              </div>
              <div className="col-span-3 text-stone-400">
                Kräver separat licens
              </div>
              <div className="col-span-4 font-semibold text-[#15803d] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Fri standard SIE-4 export</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Pricing Section */}
      <section id="priser" className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-[#b45309] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Tidig åtkomst
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917]">
              Kostnadsfritt under betaperioden
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Vi utvecklar Klaro tillsammans med svenska frilansare och småföretagare. All funktionalitet ingår utan bindningstid.
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-[#e7e2d7] bg-white text-left space-y-6 shadow-xs">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1c1917]">Klaro Cockpit</h3>
                <p className="text-xs text-stone-500">För Enskild Firma & Aktiebolag</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-mono text-[#1c1917]">0 kr</span>
                <span className="text-xs text-stone-500 block">under betan</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700 pt-2 border-t border-[#e7e2d7]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Realtidsberäkning av moms & preliminärskatt</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Kvittoavläsning med moms (25%, 12%, 6%)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Skapa godkända A4-fakturor med Bankgiro & OCR</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Open Banking-koppling (PSD2) mot din bank</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>Fri SIE-4 export för deklaration och bokslut</span>
              </li>
            </ul>

            <button
              onClick={onEnterApp}
              className="w-full py-3 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-xs transition active:scale-95 cursor-pointer shadow-xs"
            >
              Kom igång direkt utan konto
            </button>
          </div>

        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section id="faq" className="py-20 bg-white border-t border-[#e7e2d7]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-[#d97706]">
              Frågor & svar
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917]">
              Vanliga frågor från företagare
            </h2>
          </div>

          <div className="border border-[#e7e2d7] rounded-2xl bg-white divide-y divide-[#e7e2d7] overflow-hidden shadow-2xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#1c1917] hover:text-[#b45309] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-stone-800' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section className="py-18 bg-[#1c1917] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f7eedc]">
            Ta kontroll över företagspengarna i dag
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
            Testa Klaro direkt i webbläsaren med förifyllda siffror. Ingen registrering eller kontokort krävs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              Öppna cockpiten nu
            </button>
            <button
              onClick={onOpenDemoTour}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition active:scale-95 cursor-pointer"
            >
              Starta guidad tur (60s)
            </button>
          </div>
        </div>
      </section>

      {/* 10. Clean Scandinavian Footer */}
      <footer className="bg-white py-10 text-xs text-stone-500 border-t border-[#e7e2d7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#1c1917] text-[#d97706] font-bold text-[10px] flex items-center justify-center">
              K
            </div>
            <span className="font-semibold text-[#1c1917]">Klaro Technologies AB</span>
            <span>•</span>
            <span>Stockholm, Sverige</span>
          </div>

          <div className="flex items-center gap-6 text-stone-500">
            <button onClick={onEnterApp} className="hover:text-[#1c1917] transition">Cockpit</button>
            <a href="#kalkylator" className="hover:text-[#1c1917] transition">Kalkylator</a>
            <a href="#funktioner" className="hover:text-[#1c1917] transition">Funktioner</a>
            <a href="#priser" className="hover:text-[#1c1917] transition">Priser</a>
            <a href="#faq" className="hover:text-[#1c1917] transition">Frågor & svar</a>
          </div>

          <div className="font-mono text-stone-400 text-[11px]">
            Bokföringslagen • Skatteverket 2026 • SIE-4
          </div>
        </div>
      </footer>

    </div>
  );
}
