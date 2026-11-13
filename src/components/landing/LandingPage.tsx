'use client';

import React, { useState } from 'react';
import { formatSEK } from '@/lib/utils';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Receipt, 
  FileCheck, 
  Landmark, 
  Calculator, 
  HelpCircle,
  Building2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Download,
  Lock,
  Smartphone,
  Eye,
  Check,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDemoTour: () => void;
}

export function LandingPage({ onEnterApp, onOpenDemoTour }: LandingPageProps) {
  // Interactive Hero Calculator State
  const [monthlyRevenue, setMonthlyRevenue] = useState(85000);
  const [companyType, setCompanyType] = useState<'enskild_firma' | 'aktiebolag'>('enskild_firma');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Dynamic calculations based on monthly revenue
  const vatAmount = Math.round(monthlyRevenue * 0.20); // 25% moms represents 20% of gross
  const netRevenue = monthlyRevenue - vatAmount;
  
  // Enskild firma: ~43% total tax on profit (egenavgifter after schablon + municipal tax)
  // AB: ~20.6% bolagsskatt (or owner salary)
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
      a: 'Varje gång en intäkt eller kostnad registreras beräknar Klaro den exakta momsskulden (utgående minus ingående moms) samt preliminär F-skatt och egenavgifter. Beloppet som återstår är ditt garanterat disponibla belopp – noll risk för kvarskatt.',
    },
    {
      q: 'Fungerar Klaro för både Enskild Firma och Aktiebolag?',
      a: 'Ja! Du växlar bolagsform med ett klick. För Enskild Firma beräknar Klaro schablonavdrag (25%), egenavgifter (28,97%) och kommunalskatt. För Aktiebolag reserveras bolagsskatt (20,6%) och avräkning för ägarutlägg.',
    },
    {
      q: 'Är kvitton och underlag godkända enligt Bokföringslagen?',
      a: 'Absolut. Klaro sparar digitala originalunderlag i enlighet med 7 kap. Bokföringslagen och mappar automatiskt varje affärshändelse mot standardiserade BAS-konton (t.ex. 5420 Programvaror, 5800 Resor). Du kan när som helst exportera SIE-4 filer.',
    },
    {
      q: 'Hur fungerar bankavstämningen via PSD2?',
      a: 'Genom Finansinspektionen-godkända Open Banking API:er kan du ansluta Handelsbanken, Swedbank, SEB, Nordea med flera. Klaro matchar transaktioner automatiskt och varnar om ett kortköp saknar kvitto så att du inte går miste om momsavdrag.',
    },
    {
      q: 'Ersätter Klaro min redovisningskonsult?',
      a: 'Klaro sköter den dagliga överblicken och gör att du slipper göra misstag under året. När det är dags för bokslut exporterar du en komplett SIE-4 fil som din redovisningsbyrå eller revisor läser in i Fortnox, Visma eller Capego på fem sekunder.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900 font-sans selection:bg-zinc-200">
      
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0c3123] flex items-center justify-center text-white font-extrabold text-base shadow-xs">
              K
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-zinc-950 block leading-tight">
                Klaro
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block -mt-0.5">
                Skattebuffert & Bokföring
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600">
            <a href="#funktioner" className="hover:text-zinc-950 transition">Funktioner</a>
            <a href="#kalkylator" className="hover:text-zinc-950 transition">Skattekalkylator</a>
            <a href="#jamforelse" className="hover:text-zinc-950 transition">Varför Klaro</a>
            <a href="#priser" className="hover:text-zinc-950 transition">Priser</a>
            <a href="#faq" className="hover:text-zinc-950 transition">Vanliga frågor</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDemoTour}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Snabbdemo (60s)</span>
            </button>

            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0c3123] hover:bg-[#144734] shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>Öppna Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Swedish Fintech Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-2xs text-xs font-semibold text-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Sveriges smartaste skattebuffert för enskild firma & AB</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.12]">
              Sluta gissa hur mycket på företagskontot som <span className="text-[#0c3123] underline decoration-emerald-600/40 decoration-4 underline-offset-4">faktiskt är dina</span>.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
              Klaro reserverar moms och F-skatt automatiskt vid varje inbetalning. Full koll på disponibel lön, AI-kvitton och momsdeklaration – utan kvarskatt eller revisorsångest.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0c3123] hover:bg-[#144734] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <span>Testa Live Cockpit direkt</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDemoTour}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-semibold text-sm flex items-center justify-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Interaktiv rundtur (60 sek)</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-6 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Bokföringslagen 7 kap.
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Mobilt BankID & PSD2
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Skatteverket SKV 4700 & SIE-4
              </span>
            </div>

          </div>

          {/* 3. Hero Visual & Interactive Live Simulator Teaser */}
          <div id="kalkylator" className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Interaktiv kalkylator
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 mt-1">
                  Se hur mycket du kan ta ut vid din omsättning
                </h3>
              </div>

              {/* Company Type Switcher */}
              <div className="flex items-center rounded-xl bg-zinc-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCompanyType('enskild_firma')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    companyType === 'enskild_firma'
                      ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Enskild Firma
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyType('aktiebolag')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    companyType === 'aktiebolag'
                      ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Aktiebolag (AB)
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Månatlig fakturering (inkl. moms):</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-950 tabular-nums">
                  {formatSEK(monthlyRevenue)}
                </span>
              </div>

              <input
                type="range"
                min="25000"
                max="250000"
                step="5000"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full accent-[#0c3123] h-2 bg-zinc-100 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>25 000 kr</span>
                <span>125 000 kr</span>
                <span>250 000 kr</span>
              </div>
            </div>

            {/* Segmented Capital Track */}
            <div className="space-y-2">
              <div className="h-4 rounded-xl overflow-hidden flex shadow-inner bg-zinc-100">
                <div style={{ width: `${safePct}%` }} className="bg-[#0c3123] transition-all duration-300" title={`Säkert: ${safePct}%`} />
                <div style={{ width: `${vatPct}%` }} className="bg-amber-500 transition-all duration-300" title={`Moms: ${vatPct}%`} />
                <div style={{ width: `${taxPct}%` }} className="bg-zinc-700 transition-all duration-300" title={`Skatt: ${taxPct}%`} />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2 pt-1 text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0c3123]" />
                  <span>Säkert att ta ut ({safePct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Momsreserv ({vatPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-700" />
                  <span>F-skatt / Bolagsskatt ({taxPct}%)</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono block">
                  Säkert disponibelt
                </span>
                <div className="text-2xl font-black font-mono text-emerald-950 tabular-nums">
                  {formatSEK(safeToSpend)}
                </div>
                <p className="text-[11px] text-emerald-800">Dina pengar, fria att använda.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono block">
                  Moms att inbetala
                </span>
                <div className="text-2xl font-black font-mono text-amber-950 tabular-nums">
                  {formatSEK(vatAmount)}
                </div>
                <p className="text-[11px] text-amber-800">Ruta 49 till Skatteverket.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 font-mono block">
                  {companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt (20.6%)'}
                </span>
                <div className="text-2xl font-black font-mono text-zinc-950 tabular-nums">
                  {formatSEK(taxBuffer)}
                </div>
                <p className="text-[11px] text-zinc-500">Reserveras för slutskattebesked.</p>
              </div>

            </div>

            {/* Direct Link Into Live Cockpit */}
            <div className="pt-2 text-center">
              <button
                onClick={onEnterApp}
                className="text-xs font-bold text-[#0c3123] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Öppna hela cockpiten med förifyllda exempeltal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Core Features / Superpowers Grid */}
      <section id="funktioner" className="py-20 bg-white border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Byggt för svenska företagare
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              Allt du behöver för att slippa bokföringsstress
            </h2>
            <p className="text-sm text-zinc-600">
              Klaro kopplar ihop bank, kvitton och fakturor i ett sammanhängande realtidsflöde.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-zinc-200/90 bg-[#fcfbf9] space-y-4 hover:border-emerald-600/50 transition duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6 text-[#0c3123]" />
              </div>
              <h3 className="font-bold text-base text-zinc-950">Realtidsbuffert mot kvarskatt</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Vid varje transaktion räknar Klaro ut exakt vad som ska till Skatteverkets Bankgiro 5050-1055. Noll överraskningar när deklarationen kommer.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-zinc-200/90 bg-[#fcfbf9] space-y-4 hover:border-emerald-600/50 transition duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                <Receipt className="w-6 h-6 text-[#0c3123]" />
              </div>
              <h3 className="font-bold text-base text-zinc-950">AI-kvittotolkning (BFL)</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Fota kvitto eller vidarebefordra via e-post. Klaro läser ut 25%, 12%, 6% moms och bokför automatiskt på rätt BAS-konto (t.ex. 5420 IT, 5800 Resor).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-zinc-200/90 bg-[#fcfbf9] space-y-4 hover:border-emerald-600/50 transition duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                <Landmark className="w-6 h-6 text-[#0c3123]" />
              </div>
              <h3 className="font-bold text-base text-zinc-950">Bankavstämning & Skatterisk</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                PSD2-koppling mot Handelsbanken, Swedbank, SEB m.fl. Varnar om kvitto saknas och räknar ut ditt förlorade skatteavdrag. 1 klick för "Eget uttag (BAS 2013)".
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-zinc-200/90 bg-[#fcfbf9] space-y-4 hover:border-emerald-600/50 transition duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                <FileCheck className="w-6 h-6 text-[#0c3123]" />
              </div>
              <h3 className="font-bold text-base text-zinc-950">Godkänd A4 PDF-faktura</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Skapa snygga svenska kundfakturor med Bankgiro, OCR och godkänd F-skattklausul. Klaro reserverar automatiskt utgående moms i din buffert.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Comparison: Klaro vs Traditionell Bokföring */}
      <section id="jamforelse" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500">Jämförelse</span>
            <h2 className="text-3xl font-black text-zinc-950">Varför traditionell bokföring skapar skattechocker</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Way */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="font-bold text-sm text-zinc-700">Traditionellt system (Fortnox, Visma m.fl.)</span>
                <span className="text-xs font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Bakåtblickande</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Visar bara ditt banksaldo utan att dra av momsskuld eller preliminärskatt.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Tvingar dig att gissa debet och kredit och tolka kryptiska 4-siffriga kontonummer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Varnar inte för hur mycket skatteavdrag du förlorar när du tappar ett kvitto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Du får reda på din skatt först när redovisningskonsulten ringer månader senare.</span>
                </li>
              </ul>
            </div>

            {/* The Klaro Way */}
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-emerald-600/60 bg-linear-to-b from-white to-emerald-50/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <span className="font-black text-base text-[#0c3123] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Klaro
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">Realtid & Framåtblickande</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-800 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Visar alltid <strong>Säkert att ta ut</strong> direkt i översikten efter alla skattereserver.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Automatisk BAS-kontoplan & momskontering via AI – noll revisorsjargong.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Beräknar exakt förlorat skatteavdrag och erbjuder 1-klick eget uttag för privata köp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Exportera standardiserad SIE-4 och XML direkt till Skatteverkets e-tjänst.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Transparent Pricing / Beta Free Tier */}
      <section id="priser" className="py-20 bg-white border-y border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Enkel prissättning
            </span>
            <h2 className="text-3xl font-black text-zinc-950">Byggt för soloprenörer</h2>
            <p className="text-sm text-zinc-600">
              Inga bindningstider, inga dolda transaktionsavgifter.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-3xl border-2 border-[#0c3123] bg-[#fcfbf9] p-8 space-y-6 text-left shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-950">Klaro Frilans</h3>
                <p className="text-xs text-zinc-500">För enskilda firmor och nystartade AB</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Öppen Beta
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono text-zinc-950">0 kr</span>
              <span className="text-xs text-zinc-500 font-mono">/ månad under betan</span>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Realtidsberäkning av Skattekonto & disponibelt belopp</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Obegränsad AI-kvittotolkning & BAS-kontering</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Svensk A4 PDF-fakturering med F-skatt & Bankgiro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>PSD2 Bankavstämning & Skatteavdragsriskkalkylator</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>SIE-4 och Skatteverket XML export</span>
              </li>
            </ul>

            <button
              onClick={onEnterApp}
              className="w-full py-3 rounded-xl bg-[#0c3123] hover:bg-[#144734] text-white font-bold text-sm shadow-md transition active:scale-95 text-center cursor-pointer"
            >
              Kom igång gratis nu
            </button>
          </div>

        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500">FAQ</span>
            <h2 className="text-3xl font-black text-zinc-950">Vanliga frågor och svar</h2>
          </div>

          <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="transition">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
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

      {/* 8. Bottom CTA Banner */}
      <section className="py-16 bg-[#0c3123] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#f1e5c8]">
            Redo att ta kontroll över dina företagspengar?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Testa Klaro direkt i webbläsaren utan registrering eller kontokort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#f1e5c8] hover:bg-white text-zinc-950 font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
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

      {/* 9. Global Scandinavian Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#0c3123] text-white font-extrabold text-xs flex items-center justify-center">
              K
            </div>
            <span className="font-bold text-zinc-900">Klaro Technologies AB</span>
            <span>•</span>
            <span>Stockholm, Sverige</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-500">
            <button onClick={onEnterApp} className="hover:text-zinc-900 transition">Cockpit</button>
            <a href="#kalkylator" className="hover:text-zinc-900 transition">Skattekalkylator</a>
            <a href="#priser" className="hover:text-zinc-900 transition">Priser</a>
            <a href="#faq" className="hover:text-zinc-900 transition">Vanliga frågor</a>
          </div>

          <div className="font-mono text-zinc-400">
            Skatteverket 2026 • Bokföringslagen • SIE-4
          </div>
        </div>
      </footer>

    </div>
  );
}
