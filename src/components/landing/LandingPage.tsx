'use client';

import React, { useState, useEffect } from 'react';
import { formatSEK } from '@/lib/utils';
import { 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  Landmark, 
  Receipt, 
  FileText, 
  Building2, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight,
  Download,
  AlertTriangle,
  Sparkles,
  Zap,
  Clock,
  Eye,
  CheckCircle2,
  Sliders,
  Layers,
  CheckCheck
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDemoTour: () => void;
}

// Preset Swedish Invoices for interactive test
const PRESET_INVOICES = [
  { label: 'Webbutveckling', client: 'Nordic Brand AB', amount: 45000, vatRate: 25 },
  { label: 'Konsultarvode', client: 'TechFlow Sverige', amount: 85000, vatRate: 25 },
  { label: 'Designsystem', client: 'Klarna Partner', amount: 125000, vatRate: 25 },
  { label: 'Retainer Q2', client: 'Stockholm Media', amount: 160000, vatRate: 25 },
];

// Sample receipts for interactive scanner tab
const SCANNER_RECEIPTS = [
  {
    merchant: 'Webhallen Sverige AB',
    item: 'Ergonomisk skärm & tillbehör',
    date: '12 apr 2026',
    total: 2490,
    vat: 498,
    rate: '25%',
    bas: '5420 IT-tjänster & Utrustning',
    category: 'Kontorsinventarier'
  },
  {
    merchant: 'SJ Snabbtåg Stockholm-Gbg',
    item: 'Tågresa kundmöte',
    date: '14 apr 2026',
    total: 840,
    vat: 50.4,
    rate: '6%',
    bas: '5800 Resekostnader',
    category: 'Tjänsteresa'
  },
  {
    merchant: 'Adobe Creative Cloud',
    item: 'Månadsprenumeration',
    date: '15 apr 2026',
    total: 719,
    vat: 143.8,
    rate: '25%',
    bas: '5420 Programvaror',
    category: 'Mjukvara'
  }
];

// Connected Swedish Banks
const CONNECTED_BANKS = [
  'Handelsbanken',
  'Swedbank',
  'SEB',
  'Nordea',
  'Danske Bank',
  'Länsförsäkringar',
  'ICA Banken',
  'SBAB'
];

export function LandingPage({ onEnterApp, onOpenDemoTour }: LandingPageProps) {
  // Interactive Simulator State
  const [revenue, setRevenue] = useState(85000);
  const [companyType, setCompanyType] = useState<'enskild_firma' | 'aktiebolag'>('enskild_firma');
  const [safetyMode, setSafetyMode] = useState<'with_klaro' | 'without_klaro'>('with_klaro');

  // Interactive Showcase Tab
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'scanner' | 'bank' | 'invoice'>('scanner');
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Exact Tax Calculations
  const vatAmount = Math.round(revenue * 0.20); // 25% moms on net = 20% of gross
  const netRevenue = revenue - vatAmount;
  
  // Tax buffer calculations
  // Enskild Firma: ~43% total tax on profit (25% schablonavdrag + 28.97% egenavgifter + 32% kommunalskatt)
  // Aktiebolag: 20.6% bolagsskatt
  const taxBuffer = companyType === 'enskild_firma' 
    ? Math.round(netRevenue * 0.43)
    : Math.round(netRevenue * 0.206);

  const safeToSpend = netRevenue - taxBuffer;
  const safePct = Math.round((safeToSpend / revenue) * 100);
  const vatPct = Math.round((vatAmount / revenue) * 100);
  const taxPct = 100 - safePct - vatPct;

  const currentReceipt = SCANNER_RECEIPTS[selectedReceiptIndex];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* 1. Frosted Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f4]/85 border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0c3123] flex items-center justify-center text-[#f1e5c8] font-black text-base shadow-sm ring-1 ring-black/10">
              K
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-zinc-950 block leading-none">
                Klaro
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                Finansiell klarhet
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#kalkylator" className="hover:text-zinc-950 transition hover:-translate-y-0.5">Skattekalkylator</a>
            <a href="#motor" className="hover:text-zinc-950 transition hover:-translate-y-0.5">Så fungerar det</a>
            <a href="#bolagsform" className="hover:text-zinc-950 transition hover:-translate-y-0.5">EF vs AB</a>
            <a href="#jamforelse" className="hover:text-zinc-950 transition hover:-translate-y-0.5">Varför Klaro</a>
            <a href="#priser" className="hover:text-zinc-950 transition hover:-translate-y-0.5">Pris</a>
            <a href="#faq" className="hover:text-zinc-950 transition hover:-translate-y-0.5">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDemoTour}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200/90 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#0c3123]" />
              <span>Snabbdemo (60s)</span>
            </button>

            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0c3123] hover:bg-[#133d2c] shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer ring-1 ring-[#0c3123]/20"
            >
              <span>Öppna Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#f1e5c8]" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section: The "Confidence Over Guesswork" Visual Center */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        
        {/* Subtle geometric line patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#0c3123_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Main Top Pitch */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 shadow-2xs text-xs font-medium text-zinc-800 animate-float">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-semibold text-[#0c3123]">Klaro 2026</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600">Realtidsbuffert mot kvarskatt</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 leading-[1.1] sm:leading-[1.08]">
              Ditt företagskonto ljuger. <br />
              <span className="text-[#0c3123] underline decoration-[#0c3123]/20 underline-offset-8">
                Hälften tillhör Skatteverket.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
              Klaro räknar bort moms och F-skatt i samma sekund som en kund betalar. 
              Du vet alltid exakt vad du säkert kan föra över till ditt privata konto — utan kvarskattchock i maj.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0c3123] hover:bg-[#133d2c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer ring-1 ring-white/10"
              >
                <span>Testa Live Cockpit gratis</span>
                <ArrowRight className="w-4 h-4 text-[#f1e5c8]" />
              </button>

              <button
                onClick={onOpenDemoTour}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-semibold text-sm flex items-center justify-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-zinc-600" />
                <span>Interaktiv rundtur (60 sek)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                Bokföringslagen 7 kap.
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                Skattekontot BG 5050-1055
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                Standardiserad SIE-4 Export
              </span>
            </div>

          </div>

          {/* 3. Hero Interactive Living Engine: The Capital Splitter */}
          <div id="kalkylator" className="mt-14 max-w-5xl mx-auto">
            
            {/* The Outer Frame */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(12,49,35,0.08),0_1px_3px_rgba(0,0,0,0.04)] space-y-8 relative overflow-hidden">
              
              {/* Header inside frame: Company Toggle & Mode Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0c3123]/5 text-[#0c3123] text-xs font-mono font-bold border border-[#0c3123]/10">
                      Skatte-simulator
                    </span>
                    <span className="text-xs text-zinc-500">Dra eller välj en faktura nedan</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 mt-1">
                    Hur mycket kan du ta ut denna månad?
                  </h3>
                </div>

                {/* Company Type Tabs */}
                <div className="flex items-center rounded-xl bg-zinc-100 p-1 text-xs font-bold self-start sm:self-auto border border-zinc-200/70">
                  <button
                    type="button"
                    onClick={() => setCompanyType('enskild_firma')}
                    className={`px-3.5 py-2 rounded-lg transition-all ${
                      companyType === 'enskild_firma'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    Enskild Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyType('aktiebolag')}
                    className={`px-3.5 py-2 rounded-lg transition-all ${
                      companyType === 'aktiebolag'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    Aktiebolag (AB)
                  </button>
                </div>
              </div>

              {/* Preset Quick Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  Snabbval: vanliga fakturabelopp
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_INVOICES.map((p) => {
                    const isSelected = revenue === p.amount;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setRevenue(p.amount)}
                        className={`p-3 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-[#0c3123] bg-[#0c3123]/5 ring-1 ring-[#0c3123]'
                            : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 hover:border-zinc-300'
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-zinc-500 truncate">{p.label}</div>
                        <div className="text-sm font-black font-mono text-zinc-950 mt-0.5">
                          {formatSEK(p.amount)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Slider */}
              <div className="space-y-3 bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-zinc-700">
                    Eller ställ in valfri månatlig fakturering (inkl. 25% moms):
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-950 tabular-nums">
                    {formatSEK(revenue)}
                  </span>
                </div>

                <input
                  type="range"
                  min="20000"
                  max="250000"
                  step="5000"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full accent-[#0c3123] h-2.5 bg-zinc-200 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>20 000 kr</span>
                  <span>125 000 kr</span>
                  <span>250 000 kr</span>
                </div>
              </div>

              {/* Segmented Color Flow Bar */}
              <div className="space-y-2.5">
                <div className="h-4 rounded-xl overflow-hidden flex bg-zinc-100 shadow-inner">
                  <div
                    style={{ width: `${safePct}%` }}
                    className="bg-[#0c3123] transition-all duration-300 relative group"
                    title={`Ditt disponibla överskott: ${safePct}%`}
                  />
                  <div
                    style={{ width: `${vatPct}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`Momsreserv: ${vatPct}%`}
                  />
                  <div
                    style={{ width: `${taxPct}%` }}
                    className="bg-zinc-700 transition-all duration-300"
                    title={`F-skatt / Bolagsskatt: ${taxPct}%`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-600 gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#0c3123]">
                    <span className="w-3 h-3 rounded-xs bg-[#0c3123]" />
                    <span>Ditt disponibla överskott ({safePct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-amber-700">
                    <span className="w-3 h-3 rounded-xs bg-amber-500" />
                    <span>Momsreserv till Skatteverket ({vatPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-700">
                    <span className="w-3 h-3 rounded-xs bg-zinc-700" />
                    <span>{companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt'} ({taxPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Three Physical Pockets Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Pocket 1: Safe To Spend */}
                <div className="p-5 rounded-2xl bg-[#0c3123] text-white space-y-2 relative shadow-md overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                      Säkert disponibelt
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-emerald-200 font-mono">
                      100% säkert
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-[#f1e5c8] tabular-nums">
                    {formatSEK(safeToSpend)}
                  </div>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Dina pengar. Överför till ditt privata lönekonto när du vill utan att riskera restskatt.
                  </p>
                </div>

                {/* Pocket 2: Moms */}
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-900 font-bold">
                      Reserverad Moms
                    </span>
                    <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-full text-amber-900 font-mono">
                      Ruta 49
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-amber-950 tabular-nums">
                    {formatSEK(vatAmount)}
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Utgående moms som ska in till Skatteverket vid kvartalsdeklarationen.
                  </p>
                </div>

                {/* Pocket 3: F-skatt */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold">
                      {companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt (20.6%)'}
                    </span>
                    <span className="text-[10px] bg-zinc-200 px-2 py-0.5 rounded-full text-zinc-800 font-mono">
                      Preliminärskatt
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-zinc-950 tabular-nums">
                    {formatSEK(taxBuffer)}
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Reserveras för kommunalskatt och sociala avgifter vid slutskattebeskedet.
                  </p>
                </div>

              </div>

              {/* The "Utan Klaro vs Med Klaro" Anxiety Switch */}
              <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-zinc-900">
                      Se skillnaden: Vad händer utan en realtidsbuffert?
                    </span>
                  </div>

                  <div className="flex items-center rounded-lg bg-white p-1 text-xs font-bold border border-zinc-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSafetyMode('without_klaro')}
                      className={`px-3 py-1 rounded-md transition ${
                        safetyMode === 'without_klaro'
                          ? 'bg-rose-100 text-rose-900 font-bold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Traditionellt (Gissa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafetyMode('with_klaro')}
                      className={`px-3 py-1 rounded-md transition ${
                        safetyMode === 'with_klaro'
                          ? 'bg-[#0c3123] text-white font-bold shadow-2xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Med Klaro (Trygg)
                    </button>
                  </div>
                </div>

                {safetyMode === 'without_klaro' ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 animate-in fade-in duration-150">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>⚠️ Kvarskattrisk: {formatSEK(vatAmount + taxBuffer)}</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Ditt bankkonto visar {formatSEK(revenue)}. Om du överför hela beloppet till ditt privatkonto har du omedvetet spenderat Skatteverkets pengar. I maj kommer en obehaglig kvarskattchock.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in duration-150">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Skyddad: {formatSEK(safeToSpend)} disponibelt • {formatSEK(vatAmount + taxBuffer)} reserverat</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Klaro separerar pengarna direkt. När Skatteverket vill ha momsen finns den redan redo på Skattekontot. Du sover gott om natten.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. Swedish Banks Marquee (Moving Financial Ribbon) */}
      <section className="py-8 bg-white border-y border-zinc-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
            Realtidskoppling via Finansinspektionen godkänd Open Banking (PSD2)
          </span>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
            {[...CONNECTED_BANKS, ...CONNECTED_BANKS, ...CONNECTED_BANKS].map((bank, index) => (
              <div
                key={`${bank}-${index}`}
                className="inline-flex items-center gap-2.5 text-zinc-700 font-bold text-sm hover:text-zinc-950 transition cursor-default"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{bank}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive "Bokföring i rörelse" Showcase */}
      <section id="motor" className="py-24 bg-[#f8f7f4] border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#0c3123] bg-[#0c3123]/5 px-3 py-1 rounded-full border border-[#0c3123]/10">
              Interaktiv produktupplevelse
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Så sköter Klaro din vardagsekonomi
            </h2>
            <p className="text-sm text-zinc-600">
              Klicka på flikarna för att uppleva hur Klaro hanterar kvitton, banken och fakturor i realtid.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-zinc-200/80 border border-zinc-300/80 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveShowcaseTab('scanner')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
                  activeShowcaseTab === 'scanner'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Receipt className="w-4 h-4 text-[#0c3123]" />
                <span>Kvittotolken (BFL 7 kap.)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShowcaseTab('bank')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
                  activeShowcaseTab === 'bank'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Landmark className="w-4 h-4 text-[#0c3123]" />
                <span>Bankavstämning & Skatterisk</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShowcaseTab('invoice')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
                  activeShowcaseTab === 'invoice'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <FileText className="w-4 h-4 text-[#0c3123]" />
                <span>A4-Faktura på 30s</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xl">
            
            {/* View 1: Receipt Scanner with active scanline animation */}
            {activeShowcaseTab === 'scanner' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
                
                {/* Left: The Physical Receipt with Laser Scanline */}
                <div className="md:col-span-5 relative">
                  <div className="relative bg-[#fcfbf9] border border-zinc-300 rounded-2xl p-5 shadow-md font-mono text-xs space-y-4 overflow-hidden">
                    
                    {/* Animated Scanline Laser */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-scanline pointer-events-none" />

                    <div className="border-b border-dashed border-zinc-300 pb-3 text-center">
                      <div className="font-bold text-sm text-zinc-900">{currentReceipt.merchant}</div>
                      <div className="text-[10px] text-zinc-500">Org.nr 556789-0123 • {currentReceipt.date}</div>
                    </div>

                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-600">{currentReceipt.item}</span>
                        <span className="font-bold text-zinc-900">{formatSEK(currentReceipt.total)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Varav moms ({currentReceipt.rate}):</span>
                        <span className="font-bold text-emerald-800">{formatSEK(currentReceipt.vat)}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-zinc-300 pt-3 flex justify-between font-bold text-sm">
                      <span>TOTALT SEK</span>
                      <span>{formatSEK(currentReceipt.total)}</span>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-200 text-[11px] text-emerald-900">
                      <div className="font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Godkänt arkivformat (BFL 7 kap.)</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 mt-0.5">Konterad: {currentReceipt.bas}</div>
                    </div>
                  </div>

                  {/* Switch test receipt buttons */}
                  <div className="flex justify-center gap-2 mt-3">
                    {SCANNER_RECEIPTS.map((r, idx) => (
                      <button
                        key={r.merchant}
                        type="button"
                        onClick={() => setSelectedReceiptIndex(idx)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition ${
                          selectedReceiptIndex === idx
                            ? 'bg-[#0c3123] text-white border-[#0c3123] font-bold'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        Kvitto {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: What Klaro Does Automatically */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Direkt skatteeffekt
                    </span>
                    <h3 className="text-2xl font-black text-zinc-950 mt-1.5">
                      Kvittot sänker din skatt omedelbart
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                      När du köper något till företaget ska du varken betala moms eller skatt på beloppet. Klaro räknar om din skatteskuld samma sekund som kvittot tolkas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        Ingående moms
                      </span>
                      <div className="text-lg font-bold font-mono text-emerald-800 mt-0.5">
                        - {formatSEK(currentReceipt.vat)}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Dras av från Skatteverkets momsskuld.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-mono uppercase text-emerald-900 font-bold block">
                        Ditt disponibla ökar
                      </span>
                      <div className="text-lg font-bold font-mono text-emerald-950 mt-0.5">
                        + {formatSEK(Math.round(currentReceipt.vat + (currentReceipt.total - currentReceipt.vat) * 0.43))}
                      </div>
                      <p className="text-[10px] text-emerald-800 mt-1">Genom minskad skatt på årets vinst.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700">Digitalt kvitto sparat enligt Bokföringslagen</span>
                    <span className="font-mono text-emerald-800 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Originalverifierat
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* View 2: Bank Reconciliation Tab */}
            {activeShowcaseTab === 'bank' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">Handelsbanken Företagskonto</h3>
                    <p className="text-xs text-zinc-500 font-mono">IBAN SE45 6000 0000 1234 5678 • Synkad nyss via PSD2</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Live-ansluten</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        +
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Kundinbetalning: Faktura #1042</div>
                        <div className="text-[10px] text-zinc-500 font-mono">Nordic Brand AB • 14 apr 2026</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-emerald-800">+ 45 000 kr</div>
                      <span className="text-[10px] font-mono text-zinc-500">Moms 9 000 kr reserverad</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        !
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Kortköp: SJ Biljett</div>
                        <div className="text-[10px] text-amber-800 font-mono font-bold">Kvitto saknas • Risk förlorat avdrag 210 kr</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onEnterApp}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0c3123] text-white hover:bg-[#133d2c] transition cursor-pointer"
                      >
                        Ladda upp kvitto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-100 text-xs text-zinc-600 flex items-center justify-between">
                  <span>Klaro varnar dig i mobilen innan du slänger kvitton, så att du aldrig går miste om skatteavdrag.</span>
                  <button onClick={onEnterApp} className="font-bold text-[#0c3123] hover:underline shrink-0">
                    Öppna bankvyn →
                  </button>
                </div>
              </div>
            )}

            {/* View 3: A4 Invoice Builder Preview */}
            {activeShowcaseTab === 'invoice' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
                <div className="md:col-span-5 bg-white border border-zinc-300 rounded-xl p-5 shadow-md font-mono text-xs space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-zinc-200">
                    <div>
                      <div className="font-black text-sm text-zinc-950">FAKTURA</div>
                      <div className="text-[10px] text-zinc-500">Nr: 2026-1048</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">
                        Godkänd för F-skatt
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Strategisk rådgivning (30h)</span>
                      <span>36 000 kr</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Moms (25%):</span>
                      <span>9 000 kr</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-950 pt-2 border-t border-zinc-100">
                      <span>ATT BETALA:</span>
                      <span className="text-emerald-800">45 000 kr</span>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10px] text-zinc-600 space-y-0.5">
                    <div>Bankgiro: 5050-1055</div>
                    <div>OCR: 2026104803</div>
                    <div>Förfallodatum: 30 dagar netto</div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Blixtsnabb fakturering
                  </span>
                  <h3 className="text-2xl font-black text-zinc-950">
                    Fakturera på 30 sekunder. <br />
                    Momsen reserveras automatiskt.
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    När du skapar en faktura i Klaro läggs Bankgiro, OCR-nummer och lagstadgad F-skattklausul till automatiskt. När kunden betalar matchas inbetalningen automatiskt mot din bank.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={onEnterApp}
                      className="px-5 py-2.5 rounded-xl bg-[#0c3123] text-white font-bold text-xs hover:bg-[#133d2c] transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Skapa en testfaktura i cockpiten</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 6. Enskild Firma vs. Aktiebolag Deep Dive */}
      <section id="bolagsform" className="py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-zinc-500">
              Skatteregler anpassade för dig
            </span>
            <h2 className="text-3xl font-black text-zinc-950">
              Byggt för både Enskild Firma och Aktiebolag
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Växla bolagsform med ett klick. Klaro anpassar automatiskt alla beräkningar efter Skatteverkets regelverk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Enskild Firma Box */}
            <div className="p-8 rounded-3xl border border-zinc-200 bg-[#fbfbfa] space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0c3123] text-white flex items-center justify-center font-bold text-sm">
                    EF
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-950">Enskild Firma</h3>
                    <p className="text-xs text-zinc-500">Direkt privatansvar & Eget uttag</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#0c3123] bg-[#0c3123]/10 px-2 py-0.5 rounded">
                  Enklast att driva
                </span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-700 leading-relaxed font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Schablonavdrag (25%)</strong> beräknas automatiskt före egenavgifter.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Egenavgifter (28,97%)</strong> reserveras vid varje fakturainbetalning.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Eget uttag (BAS 2013)</strong> sker direkt utan krångliga lönespecifikationer.</span>
                </li>
              </ul>
            </div>

            {/* Aktiebolag Box */}
            <div className="p-8 rounded-3xl border border-zinc-200 bg-[#fbfbfa] space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    AB
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-950">Aktiebolag (AB)</h3>
                    <p className="text-xs text-zinc-500">Juridisk person & skatteplanering</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded">
                  Maximal optimering
                </span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-700 leading-relaxed font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Bolagsskatt (20,6%)</strong> reserveras på bolagets årsvinst.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Ägarutlägg (BAS 2893)</strong> hålls separerat från bolagets privata köp.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Optimera mellan <strong>månadslön (AGI)</strong> och <strong>lågbeskattad utdelning</strong> (3:12-regler).</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Comparison Table: Traditionell Bokföring vs Klaro */}
      <section id="jamforelse" className="py-20 bg-[#f8f7f4] border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-zinc-500">
              Direkt jämförelse
            </span>
            <h2 className="text-3xl font-black text-zinc-950">
              Varför traditionella program skapar ångest
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto">
              System som Fortnox och Visma är byggda för redovisningskonsulter som bokför det som redan hänt. Klaro är byggt för att du ska veta vad du har att röra dig med i dag.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-zinc-200">
            <div className="grid grid-cols-12 bg-zinc-100/90 p-4 text-xs font-bold text-zinc-700">
              <div className="col-span-5">Funktion</div>
              <div className="col-span-3 text-zinc-500">Fortnox / Visma</div>
              <div className="col-span-4 text-[#0c3123] font-black">Klaro</div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-semibold text-zinc-900">Realtidsbuffert för skatt</div>
              <div className="col-span-3 text-zinc-400">Nej (visar endast banksaldo)</div>
              <div className="col-span-4 font-bold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Räknas om vid varje inbetalning</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-semibold text-zinc-900">Disponibel lön (Safe-to-Spend)</div>
              <div className="col-span-3 text-zinc-400">Saknas (måste räknas manuellt)</div>
              <div className="col-span-4 font-bold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Alltid synligt i cockpiten</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-semibold text-zinc-900">Automatisk BAS-kontokontering</div>
              <div className="col-span-3 text-zinc-400">Kräver manuell kontering</div>
              <div className="col-span-4 font-bold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Automatisk med moms 25/12/6%</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-5 font-semibold text-zinc-900">Samarbete med redovisningsbyrå</div>
              <div className="col-span-3 text-zinc-400">Inlåst i specifikt ekosystem</div>
              <div className="col-span-4 font-bold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Fri standardiserad SIE-4 export</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="priser" className="py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-[#0c3123] bg-[#0c3123]/5 px-3 py-1 rounded-full">
              Tidig åtkomst
            </span>
            <h2 className="text-3xl font-black text-zinc-950">
              100% kostnadsfritt under beta
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              Vi utvecklar Klaro tillsammans med svenska frilansare och småföretagare. All funktionalitet ingår utan bindningstid.
            </p>
          </div>

          <div className="max-w-md mx-auto p-8 rounded-3xl border-2 border-[#0c3123] bg-[#fcfbf9] text-left space-y-6 shadow-lg relative">
            <div className="absolute -top-3 right-6 bg-[#0c3123] text-[#f1e5c8] px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
              BETA-ERBJUDANDE
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-black text-xl text-zinc-950">Klaro Cockpit</h3>
                <p className="text-xs text-zinc-500">För Enskild Firma & AB</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black font-mono text-zinc-950">0 kr</span>
                <span className="text-xs text-zinc-500 block">under hela betan</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-zinc-800 pt-2 border-t border-zinc-200">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Realtidsberäkning av Safe-to-Spend & Skatteskuld</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Kvittoavläsning med 25%, 12% och 6% moms</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Skapa och ladda ner godkända A4-fakturor</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Öppen bankkoppling (PSD2) mot svenska banker</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Fri SIE-4 export och Skatteverket XML</span>
              </li>
            </ul>

            <button
              onClick={onEnterApp}
              className="w-full py-3.5 rounded-xl bg-[#0c3123] hover:bg-[#133d2c] text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-md"
            >
              Starta direkt utan inloggning
            </button>
          </div>

        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="py-20 bg-[#f8f7f4] border-b border-zinc-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-zinc-500">
              Frågor & svar
            </span>
            <h2 className="text-3xl font-black text-zinc-950">
              Vanliga funderingar från företagare
            </h2>
          </div>

          <div className="border border-zinc-200 rounded-2xl bg-white divide-y divide-zinc-200 overflow-hidden shadow-xs">
            {[
              {
                q: 'Hur vet Klaro hur mycket jag säkert kan ta ut?',
                a: 'Varje gång en inbetalning eller utgift registreras beräknar Klaro den exakta momsskulden (utgående minus ingående moms) samt preliminär skatt och egenavgifter. Beloppet som återstår är ditt garanterat disponibla överskott. Du vet alltid vad du kan föra över till ditt privata konto utan risk för kvarskatt.'
              },
              {
                q: 'Fungerar Klaro för både Enskild Firma och Aktiebolag?',
                a: 'Ja! Du växlar bolagsform med ett klick. För Enskild Firma beräknar Klaro schablonavdrag (25%), egenavgifter (28,97%) och kommunalskatt. För Aktiebolag reserveras bolagsskatt (20,6%) och systemet håller ordning på ägarutlägg och månadslön.'
              },
              {
                q: 'Ersätter Klaro min redovisningskonsult?',
                a: 'Klaro sköter den dagliga överblicken och ser till att du inte gör misstag under året. När det är dags för bokslut exporterar du en komplett SIE-4-fil med ett klick som din redovisningsbyrå kan läsa in i Fortnox, Visma eller Capego på några sekunder.'
              },
              {
                q: 'Är kvitton godkända enligt Bokföringslagen?',
                a: 'Ja. Alla underlag sparas digitalt i enlighet med 7 kap. Bokföringslagen. Klaro mappar automatiskt affärshändelser mot BAS-kontoplanen och håller isär 25%, 12% och 6% moms.'
              },
              {
                q: 'Hur ansluter jag min bank?',
                a: 'Genom Finansinspektionen-godkända Open Banking API:er (PSD2) kan du ansluta Handelsbanken, Swedbank, SEB, Nordea med flera med Mobilt BankID. Inga lösenord eller kortuppgifter sparas hos oss.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-zinc-900 hover:text-[#0c3123] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-zinc-800' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 10. Bottom Banner */}
      <section className="py-20 bg-[#0c3123] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#f1e5c8]">
            Redo att slippa gissa hur mycket du kan ta ut?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Testa Klaro direkt i webbläsaren utan registrering eller kontokort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#f1e5c8] hover:bg-white text-zinc-950 font-black text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              Öppna Live Cockpit nu
            </button>
            <button
              onClick={onOpenDemoTour}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition active:scale-95 cursor-pointer"
            >
              Starta guidad tur (60s)
            </button>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-white py-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#0c3123] text-[#f1e5c8] font-bold text-xs flex items-center justify-center">
              K
            </div>
            <span className="font-bold text-zinc-900">Klaro Technologies AB</span>
            <span>•</span>
            <span>Stockholm, Sverige</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-500">
            <button onClick={onEnterApp} className="hover:text-zinc-900 transition">Cockpit</button>
            <a href="#kalkylator" className="hover:text-zinc-900 transition">Kalkylator</a>
            <a href="#bolagsform" className="hover:text-zinc-900 transition">EF vs AB</a>
            <a href="#priser" className="hover:text-zinc-900 transition">Priser</a>
            <a href="#faq" className="hover:text-zinc-900 transition">FAQ</a>
          </div>

          <div className="font-mono text-zinc-400">
            Skatteverket 2026 • Bokföringslagen • SIE-4
          </div>
        </div>
      </footer>

    </div>
  );
}
