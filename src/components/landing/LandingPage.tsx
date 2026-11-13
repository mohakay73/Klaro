'use client';

import React, { useState } from 'react';
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
  Info
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDemoTour: () => void;
}

export function LandingPage({ onEnterApp, onOpenDemoTour }: LandingPageProps) {
  // Interactive Calculator State
  const [monthlyRevenue, setMonthlyRevenue] = useState(75000);
  const [companyType, setCompanyType] = useState<'enskild_firma' | 'aktiebolag'>('enskild_firma');

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Exact Swedish tax calculations
  // 25% moms on net = 20% of gross revenue
  const vatAmount = Math.round(monthlyRevenue * 0.20);
  const netRevenue = monthlyRevenue - vatAmount;
  
  // Tax buffer:
  // Enskild Firma: Egenavgifter + preliminärskatt (~43% på resultat efter schablonavdrag)
  // Aktiebolag: Bolagsskatt (20.6% på vinst)
  const taxBuffer = companyType === 'enskild_firma' 
    ? Math.round(netRevenue * 0.43)
    : Math.round(netRevenue * 0.206);

  const safeToSpend = netRevenue - taxBuffer;
  const safePct = Math.round((safeToSpend / monthlyRevenue) * 100);
  const vatPct = Math.round((vatAmount / monthlyRevenue) * 100);
  const taxPct = 100 - safePct - vatPct;

  const faqs = [
    {
      q: 'Hur vet Klaro hur mycket jag faktiskt kan ta ut?',
      a: 'Varje gång en inbetalning eller utgift registreras beräknar Klaro den exakta momsskulden (utgående minus ingående moms) samt preliminär skatt. Det belopp som återstår är ditt säkert disponibla överskott. Du vet alltid vad du kan föra över till ditt privata konto utan att riskera kvarskatt.',
    },
    {
      q: 'Fungerar Klaro för både Enskild Firma och Aktiebolag?',
      a: 'Ja. För Enskild Firma beräknas schablonavdrag (25%), egenavgifter (28,97%) och kommunalskatt. För Aktiebolag reserveras bolagsskatt (20,6%) och systemet håller ordning på ägarutlägg och lön.',
    },
    {
      q: 'Ersätter Klaro min redovisningsbyrå?',
      a: 'Klaro ger dig som företagare full koll i realtid varje vecka, så att du slipper obehagliga överraskningar. När det är dags för bokslut exporterar du en komplett SIE-4-fil med ett klick. Din redovisningskonsult eller revisor kan läsa in den i Fortnox, Visma eller Capego på några sekunder.',
    },
    {
      q: 'Är kvitton och underlag godkända enligt Bokföringslagen?',
      a: 'Ja, alla underlag sparas digitalt i enlighet med 7 kap. Bokföringslagen. Klaro mappar automatiskt affärshändelser mot BAS-kontoplanen och håller isär 25%, 12% och 6% moms.',
    },
    {
      q: 'Hur fungerar kopplingen till min bank?',
      a: 'Klaro ansluter säkert via godkänd Open Banking (PSD2) med Mobilt BankID till Handelsbanken, Swedbank, SEB, Nordea med flera. Inga känsliga inloggningsuppgifter sparas hos oss.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900 font-sans selection:bg-zinc-200">
      
      {/* 1. Header Navigation */}
      <header className="border-b border-zinc-200/80 bg-[#f8f7f4]/90 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0c3123] flex items-center justify-center text-[#f1e5c8] font-bold text-sm tracking-tight">
              K
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-950">
              Klaro
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-600">
            <a href="#kalkylator" className="hover:text-zinc-950 transition">Skattekalkylator</a>
            <a href="#funktioner" className="hover:text-zinc-950 transition">Hur det fungerar</a>
            <a href="#jamforelse" className="hover:text-zinc-950 transition">Skillnaden</a>
            <a href="#priser" className="hover:text-zinc-950 transition">Priser</a>
            <a href="#faq" className="hover:text-zinc-950 transition">Frågor & svar</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDemoTour}
              className="hidden sm:inline-flex items-center text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-2 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
            >
              Se demo (60 sek)
            </button>

            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0c3123] hover:bg-[#144734] transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Öppna appen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Subtle Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-zinc-200 text-xs text-zinc-700 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
              <span>Skattebuffert & bokföringsöversikt för svenska företagare</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
              Ditt företagskonto visar vad som kommit in. <br className="hidden sm:inline" />
              <span className="text-[#0c3123]">Inte vad du får behålla.</span>
            </h1>

            {/* Calm, Grounded Subheading */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Klaro räknar automatiskt bort moms och preliminärskatt vid varje inbetalning. 
              Du vet alltid exakt vad du kan föra över till ditt privata konto — utan kvarskatt eller överraskningar.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#0c3123] hover:bg-[#144734] text-white font-semibold text-sm transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Öppna testcockpit</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDemoTour}
                className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium text-sm transition active:scale-95 cursor-pointer shadow-2xs"
              >
                Starta guidad tur (60 sek)
              </button>
            </div>

            {/* Quiet Regulatory / Compliance Footnote */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-mono">
              <span>Bokföringslagen (1999:1078)</span>
              <span>•</span>
              <span>Skattekonto BG 5050-1055</span>
              <span>•</span>
              <span>SIE-4 Standard</span>
            </div>

          </div>

          {/* 3. Interactive Calculation Tool (Grounded in Real Numbers) */}
          <div id="kalkylator" className="mt-14 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                  Hur mycket av dina fakturor är faktiskt dina?
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Dra i reglaget för att se vad som återstår efter moms och preliminärskatt.
                </p>
              </div>

              {/* Company Type Tabs */}
              <div className="flex items-center rounded-lg bg-zinc-100 p-1 text-xs font-medium self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCompanyType('enskild_firma')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    companyType === 'enskild_firma'
                      ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Enskild Firma
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyType('aktiebolag')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    companyType === 'aktiebolag'
                      ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Aktiebolag (AB)
                </button>
              </div>
            </div>

            {/* Slider Section */}
            <div className="py-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-zinc-600">
                  Fakturerat per månad (inkl. 25% moms):
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 tabular-nums">
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
                className="w-full accent-[#0c3123] h-2 bg-zinc-100 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>20 000 kr</span>
                <span>100 000 kr</span>
                <span>200 000 kr</span>
              </div>
            </div>

            {/* Segmented Capital Track */}
            <div className="space-y-2">
              <div className="h-3 rounded-lg overflow-hidden flex bg-zinc-100">
                <div style={{ width: `${safePct}%` }} className="bg-[#0c3123] transition-all duration-200" />
                <div style={{ width: `${vatPct}%` }} className="bg-amber-500 transition-all duration-200" />
                <div style={{ width: `${taxPct}%` }} className="bg-zinc-400 transition-all duration-200" />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-600 pt-1 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0c3123]" />
                  <span>Ditt säkert disponibla överskott ({safePct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Moms till Skatteverket ({vatPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-400" />
                  <span>{companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt'} ({taxPct}%)</span>
                </div>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
              
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="text-[11px] font-mono uppercase text-emerald-900 font-semibold block">
                  Säkert att ta ut
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-950 tabular-nums">
                  {formatSEK(safeToSpend)}
                </div>
                <p className="text-[11px] text-emerald-800">
                  Dina pengar, fria från framtida skatteanspråk.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="text-[11px] font-mono uppercase text-amber-900 font-semibold block">
                  Reserverad moms
                </span>
                <div className="text-2xl font-bold font-mono text-amber-950 tabular-nums">
                  {formatSEK(vatAmount)}
                </div>
                <p className="text-[11px] text-amber-800">
                  Ska in på Skattekontot vid deklarationen.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-700 font-semibold block">
                  {companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt (20,6%)'}
                </span>
                <div className="text-2xl font-bold font-mono text-zinc-950 tabular-nums">
                  {formatSEK(taxBuffer)}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Reserverat för slutskattebeskedet.
                </p>
              </div>

            </div>

            {/* Bottom note */}
            <div className="pt-4 text-center">
              <button
                onClick={onEnterApp}
                className="text-xs font-medium text-[#0c3123] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Öppna cockpiten med förifyllda exempeltal och fakturor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Concrete Workflow: How It Works */}
      <section id="funktioner" className="py-20 bg-white border-b border-zinc-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase font-semibold text-zinc-500 block mb-2">
              Arbetsflöde
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Bokföring i samma takt som du arbetar
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Traditionella system kräver att du sätter dig ner en helg varje månad. Klaro håller ordning löpande, i realtid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-bold text-sm text-zinc-800">
                1
              </div>
              <h3 className="font-bold text-base text-zinc-950">
                Fakturera och fota kvitton
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Skapa godkända fakturor med OCR och moms på 30 sekunder. Fota kvitton direkt i mobilen eller vidarebefordra digitala kvitton via e-post. Klaro tolkar 25%, 12% och 6% moms och konterar mot BAS-konton automatiskt.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-bold text-sm text-zinc-800">
                2
              </div>
              <h3 className="font-bold text-base text-zinc-950">
                Skatten separeras direkt
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                När en kund betalar räknar Klaro omedelbart ut exakt hur mycket som är moms och preliminär F-skatt. Du ser två tydliga siffror: vad som tillhör Skatteverket och vad du säkert kan spendera.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-bold text-sm text-zinc-800">
                3
              </div>
              <h3 className="font-bold text-base text-zinc-950">
                Exportera vid deklaration
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                När momsen ska deklareras genereras Skatteverkets exakta rutor (Momsdeklaration SKV 4700). Vid årets slut laddar du ner en standardiserad SIE-4-fil som din revisor eller redovisningskonsult kan läsa in direkt.
              </p>
            </div>

          </div>

          {/* Concrete UI Preview Box */}
          <div className="p-6 rounded-2xl bg-[#f8f7f4] border border-zinc-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#0c3123]" />
                <span className="font-bold text-xs text-zinc-900">Exempel på hur Klaro hanterar ett kortköp</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Handelsbanken PSD2 • BAS 5420</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-zinc-200/80">
                <span className="text-[10px] text-zinc-400 font-mono block">Banktransaktion</span>
                <span className="font-bold text-zinc-900">Webhallen Sverige AB</span>
                <span className="font-mono text-zinc-600 block mt-0.5">- 1 875,00 kr</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200/80">
                <span className="text-[10px] text-zinc-400 font-mono block">Ingående moms (25%)</span>
                <span className="font-bold text-emerald-800 font-mono">+ 375,00 kr</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Minskar momsskuld</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200/80">
                <span className="text-[10px] text-zinc-400 font-mono block">Netto kostnad</span>
                <span className="font-bold text-zinc-900 font-mono">1 500,00 kr</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">BAS 5420 IT-tjänster</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-mono block">Effekt på disponibelt</span>
                <span className="font-bold text-emerald-950 font-mono">+ 645,00 kr</span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">Skattesänkning på vinst</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Comparison: Traditionell Bokföring vs Klaro */}
      <section id="jamforelse" className="py-20 border-b border-zinc-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-semibold text-zinc-500">
              Varför Klaro
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950">
              Byggt för dig som driver företaget
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto">
              Traditionella system är byggda för redovisningskonsulter som tittar bakåt i tiden. Klaro är byggt för att du ska veta vad du har att röra dig med i dag.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-2xs divide-y divide-zinc-200">
            
            <div className="grid grid-cols-12 bg-zinc-50 p-4 text-xs font-semibold text-zinc-700">
              <div className="col-span-4 sm:col-span-5">Funktion</div>
              <div className="col-span-4 sm:col-span-3 text-zinc-500">Traditionell programvara</div>
              <div className="col-span-4 sm:col-span-4 text-[#0c3123] font-bold">Klaro</div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-4 sm:col-span-5 font-medium text-zinc-900">
                Realtidsbuffert för skatt & moms
              </div>
              <div className="col-span-4 sm:col-span-3 text-zinc-500">
                Nej (visar endast banksaldo)
              </div>
              <div className="col-span-4 sm:col-span-4 font-semibold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Räknas om vid varje köp</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-4 sm:col-span-5 font-medium text-zinc-900">
                Disponibelt belopp (Safe-to-Spend)
              </div>
              <div className="col-span-4 sm:col-span-3 text-zinc-500">
                Saknas (måste räknas manuellt)
              </div>
              <div className="col-span-4 sm:col-span-4 font-semibold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Alltid synligt i cockpiten</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-4 sm:col-span-5 font-medium text-zinc-900">
                Kvittoavläsning & BAS-kontering
              </div>
              <div className="col-span-4 sm:col-span-3 text-zinc-500">
                Ofta dyra tilläggsmoduler
              </div>
              <div className="col-span-4 sm:col-span-4 font-semibold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Ingår som standard</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-4 sm:col-span-5 font-medium text-zinc-900">
                Bankavstämning & saknade kvitton
              </div>
              <div className="col-span-4 sm:col-span-3 text-zinc-500">
                Manuellt i slutet av månaden
              </div>
              <div className="col-span-4 sm:col-span-4 font-semibold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Varnar för förlorat avdrag</span>
              </div>
            </div>

            <div className="grid grid-cols-12 p-4 text-xs items-center gap-2">
              <div className="col-span-4 sm:col-span-5 font-medium text-zinc-900">
                Samarbete med redovisningsbyrå
              </div>
              <div className="col-span-4 sm:col-span-3 text-zinc-500">
                Inlåst i specifikt ekosystem
              </div>
              <div className="col-span-4 sm:col-span-4 font-semibold text-[#0c3123] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Standard SIE-4 export</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Pricing */}
      <section id="priser" className="py-20 bg-white border-b border-zinc-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-semibold text-zinc-500">
              Prissättning
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950">
              Kostnadsfritt under beta
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              Vi utvecklar Klaro tillsammans med svenska småföretagare. All funktionalitet ingår under betaperioden utan bindningstid.
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-zinc-200 bg-[#fbfbfa] text-left space-y-6 shadow-xs">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-950">Klaro Tidig Åtkomst</h3>
                <p className="text-xs text-zinc-500">Enskild Firma & Aktiebolag</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-mono text-zinc-950">0 kr</span>
                <span className="text-xs text-zinc-500 block">under betan</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-700 pt-2 border-t border-zinc-200/80">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Realtidsberäkning av moms & preliminärskatt</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Kvittoavläsning med moms (25%, 12%, 6%)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Skapa godkända A4-fakturor med Bankgiro & OCR</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Bankavstämning med varning för saknade kvitton</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Fri SIE-4 export och Skatteverket XML</span>
              </li>
            </ul>

            <button
              onClick={onEnterApp}
              className="w-full py-3 rounded-lg bg-[#0c3123] hover:bg-[#144734] text-white font-semibold text-xs transition active:scale-95 cursor-pointer shadow-xs"
            >
              Börja använda Klaro i dag
            </button>
          </div>

        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 border-b border-zinc-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase font-semibold text-zinc-500">
              Frågor & svar
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950">
              Vanliga funderingar
            </h2>
          </div>

          <div className="border border-zinc-200 rounded-2xl bg-white divide-y divide-zinc-200 overflow-hidden shadow-2xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 hover:text-[#0c3123] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-zinc-800' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. Bottom Action Banner */}
      <section className="py-16 bg-[#0c3123] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f1e5c8]">
            Ta kontroll över företagspengarna redan i dag
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg mx-auto leading-relaxed">
            Testa Klaro direkt i webbläsaren med förifyllda siffror. Ingen registrering eller kontokort krävs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#f1e5c8] hover:bg-white text-zinc-950 font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              Öppna cockpiten
            </button>
            <button
              onClick={onOpenDemoTour}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition active:scale-95 cursor-pointer"
            >
              Se 60 sekunders demo
            </button>
          </div>
        </div>
      </section>

      {/* 9. Minimal Scandinavian Footer */}
      <footer className="bg-white py-10 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#0c3123] text-[#f1e5c8] font-bold text-[10px] flex items-center justify-center">
              K
            </div>
            <span className="font-semibold text-zinc-900">Klaro Technologies AB</span>
            <span>•</span>
            <span>Stockholm</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-500">
            <button onClick={onEnterApp} className="hover:text-zinc-900 transition">Cockpit</button>
            <a href="#kalkylator" className="hover:text-zinc-900 transition">Kalkylator</a>
            <a href="#priser" className="hover:text-zinc-900 transition">Priser</a>
            <a href="#faq" className="hover:text-zinc-900 transition">Frågor & svar</a>
          </div>

          <div className="font-mono text-zinc-400 text-[11px]">
            Bokföringslagen • Skatteverket 2026 • SIE-4
          </div>
        </div>
      </footer>

    </div>
  );
}
