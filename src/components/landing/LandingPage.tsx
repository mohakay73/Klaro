'use client';

import React, { useState } from 'react';
import { formatSEK } from '@/lib/utils';
import { 
  ArrowRight, 
  Terminal, 
  AlertOctagon, 
  Check, 
  Flame, 
  ShieldAlert, 
  Zap, 
  ArrowUpRight, 
  CornerDownRight, 
  Sparkles, 
  Coffee, 
  FileSpreadsheet,
  X,
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDemoTour: () => void;
}

export function LandingPage({ onEnterApp, onOpenDemoTour }: LandingPageProps) {
  // Brutalist Interactive Simulator State
  const [fakturaBelopp, setFakturaBelopp] = useState<number>(80000);
  const [bolagstyp, setBolagstyp] = useState<'EF' | 'AB'>('EF');
  const [selectedReceipt, setSelectedReceipt] = useState<'coffee' | 'laptop' | 'taxi'>('laptop');

  // Math: 25% moms on net revenue is 20% of gross invoice
  const moms = Math.round(fakturaBelopp * 0.20);
  const nettoIntakt = fakturaBelopp - moms;
  
  // Tax buffer:
  // EF: ~43% på vinst efter 25% schablonavdrag & egenavgifter
  // AB: 20.6% bolagsskatt (plus löneskatt om lön)
  const statensKaka = bolagstyp === 'EF' 
    ? Math.round(nettoIntakt * 0.43)
    : Math.round(nettoIntakt * 0.206);

  const dinaPengar = nettoIntakt - statensKaka;
  const statensTotal = moms + statensKaka;
  const dinaProcent = Math.round((dinaPengar / fakturaBelopp) * 100);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f4f4f5] font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* 1. Brutalist Top Tape / Banner */}
      <div className="border-b border-zinc-800 bg-[#14161b] px-4 py-2 text-[11px] font-mono flex items-center justify-between text-zinc-400 overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
          <span className="text-[#ccff00] font-bold">KLARO_SYS_v2.6</span>
          <span className="text-zinc-600">/</span>
          <span>INGEN SKATTECHOCK 2026</span>
          <span className="text-zinc-600">/</span>
          <span>BOKFÖRINGSLAGEN 7 KAP.</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-zinc-500 text-[10px]">
          <span>BG: 5050-1055</span>
          <span>•</span>
          <span>MOMS: RUTA 49</span>
          <span>•</span>
          <span className="text-zinc-300 font-bold">100% GRATIS BETA</span>
        </div>
      </div>

      {/* 2. Raw Header */}
      <header className="border-b border-zinc-800/80 px-4 sm:px-8 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#0c0d10]/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ccff00] text-black font-black flex items-center justify-center text-sm font-mono tracking-tighter">
            K/
          </div>
          <span className="font-mono font-black text-xl tracking-tighter text-white">
            KLARO
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
            ANTI-FORTNOX
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={onOpenDemoTour}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <span>[ RUNDTUR 60S ]</span>
          </button>

          <button
            onClick={onEnterApp}
            className="px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider transition active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_#ffffff]"
          >
            Öppna Cockpit →
          </button>
        </div>
      </header>

      {/* 3. Hero Section: Hard-hitting, Unapologetic Reality Check */}
      <section className="pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Manifesto & Punch */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-950/60 border border-red-800/80 text-red-400 font-mono text-xs font-bold">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SKATTEVERKET ÄR INTE DIN KOMPIS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
              Företags-kontot <br />
              <span className="text-[#ccff00] underline decoration-4 underline-offset-8">ljuger för dig.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl font-normal">
              Du fakturerar 80 000 kr. Kontot ser fett ut. Du känner dig rik. <br />
              Sen kommer maj och Skatteverket kräver in <span className="text-white font-bold underline">45 000 kr</span> i moms och F-skatt. 
              Klaro sågar av skatten i realtid så att du aldrig mer bränner pengar som inte är dina.
            </p>

            {/* Micro Feature Bullets in Monospace */}
            <div className="space-y-2 pt-2 font-mono text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="text-[#ccff00]">01//</span>
                <span>Inga debet och kredit. Inget revisorsjargong.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ccff00]">02//</span>
                <span>Ett enda nummer: "Vad kan jag swisha hem i kväll?"</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ccff00]">03//</span>
                <span>Kvittotolk som hittar momsen innan du slänger papperslappen.</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 font-mono">
              <button
                onClick={onEnterApp}
                className="px-6 py-4 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm tracking-wider uppercase transition active:translate-y-0.5 cursor-pointer shadow-[4px_4px_0px_#ffffff] flex items-center justify-center gap-2"
              >
                <span>KÖR KLARO I WEBLÄSAREN NU</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDemoTour}
                className="px-5 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold uppercase tracking-wider transition active:translate-y-0.5 cursor-pointer text-center"
              >
                Kolla 60s demo
              </button>
            </div>

            <div className="pt-2 text-[11px] font-mono text-zinc-500">
              * Kräver inget konto. Inget kreditkort. Ingen registrering.
            </div>

          </div>

          {/* Right Column: Physical "Reality Engine" Machine Widget */}
          <div className="lg:col-span-6">
            
            <div className="bg-[#13151b] border-2 border-zinc-700 p-6 sm:p-8 rounded-none shadow-[8px_8px_0px_#1e2129] space-y-6">
              
              {/* Machine Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#ccff00]" />
                  <span className="font-bold text-white uppercase tracking-wider">SKATTE-KROSSEN // VERKLIGHETSKOLL</span>
                </div>
                
                {/* EF vs AB Toggle */}
                <div className="flex border border-zinc-700 bg-black p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setBolagstyp('EF')}
                    className={`px-3 py-1 font-bold ${
                      bolagstyp === 'EF'
                        ? 'bg-[#ccff00] text-black'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Enskild Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => setBolagstyp('AB')}
                    className={`px-3 py-1 font-bold ${
                      bolagstyp === 'AB'
                        ? 'bg-[#ccff00] text-black'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Aktiebolag (AB)
                  </button>
                </div>
              </div>

              {/* Input: Invoice Size Buttons */}
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">FAKTURABELOPP TILL KUND (INKL 25% MOMS):</span>
                  <span className="text-[#ccff00] font-black text-base">{formatSEK(fakturaBelopp)}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[35000, 60000, 80000, 140000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFakturaBelopp(amt)}
                      className={`p-2 border text-xs font-bold transition ${
                        fakturaBelopp === amt
                          ? 'border-[#ccff00] bg-[#ccff00]/10 text-white shadow-[2px_2px_0px_#ccff00]'
                          : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {amt / 1000}k kr
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="5000"
                  value={fakturaBelopp}
                  onChange={(e) => setFakturaBelopp(Number(e.target.value))}
                  className="w-full accent-[#ccff00] bg-zinc-800 h-2 cursor-pointer mt-2"
                />
              </div>

              {/* Brutalist Breakdown Visual */}
              <div className="space-y-4 pt-2 font-mono">
                
                {/* Pocket A: What You Think You Have vs What You Have */}
                <div className="p-4 bg-black border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">PÅ DITT BANKKONTO:</span>
                    <span className="line-through text-red-500 font-bold">{formatSEK(fakturaBelopp)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-zinc-900">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block font-bold">
                        VAD DU FAKTISKT FÅR BEHÅLLA (SÄKERT ATT TA UT):
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-[#ccff00] tracking-tight">
                        {formatSEK(dinaPengar)}
                      </span>
                    </div>
                    <span className="text-xs bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 px-2 py-0.5 font-bold">
                      {dinaProcent}% ÄR DITT
                    </span>
                  </div>
                </div>

                {/* Pocket B: What Goes To The State */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-red-950/20 border border-red-900/50 space-y-1">
                    <span className="text-[10px] text-red-400 font-bold block">
                      MOMS (SKATTEVERKET):
                    </span>
                    <div className="text-lg font-bold text-red-300">
                      - {formatSEK(moms)}
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Ruta 49 / Inget du rör</span>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold block">
                      {bolagstyp === 'EF' ? 'EGENAVGIFTER & SKATT:' : 'BOLAGSSKATT (20,6%):'}
                    </span>
                    <div className="text-lg font-bold text-zinc-300">
                      - {formatSEK(statensKaka)}
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Preliminärskatt</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="p-3 bg-[#181a20] border-l-2 border-[#ccff00] text-xs text-zinc-300 flex items-start gap-2">
                  <CornerDownRight className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                  <span>
                    Om du tar ut mer än <strong>{formatSEK(dinaPengar)}</strong> lånar du omedvetet av Skatteverket. 
                    Klaro spärrar summan i din mentala cockpitoch räknar ned automatiskt.
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. The 3 Brutal Truths About Accounting */}
      <section className="py-20 border-y border-zinc-800 bg-[#0f1014] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="font-mono text-center space-y-2">
            <span className="text-xs text-[#ccff00] font-bold uppercase tracking-widest">[ SYSTEM-FEL ]</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Tre lögner traditionella program tutar i dig
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Lie 1 */}
            <div className="p-6 bg-black border border-zinc-800 space-y-3 relative group hover:border-[#ccff00] transition">
              <div className="text-red-500 font-bold text-sm">LÖGN 01 //</div>
              <h3 className="text-white font-bold text-base leading-snug">
                "Du måste förstå debet och kredit."
              </h3>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Du är frilansare, designer, snickare eller konsult. Du ska inte behöva en civilekonomexamen för att köpa en ny datormus. Klaro konterar allt dolt i bakgrunden enligt BAS-kontoplanen.
              </p>
            </div>

            {/* Lie 2 */}
            <div className="p-6 bg-black border border-zinc-800 space-y-3 relative group hover:border-[#ccff00] transition">
              <div className="text-red-500 font-bold text-sm">LÖGN 02 //</div>
              <h3 className="text-white font-bold text-base leading-snug">
                "Ditt banksaldo visar vad du tjänat."
              </h3>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Företagskontot är en giftig soppa av moms, F-skatt och kundreserver. Rör du det utan en realtidsbuffert väntar obarmhärtig kvarskatt i maj. Klaro separerar allt sekundsnabbt.
              </p>
            </div>

            {/* Lie 3 */}
            <div className="p-6 bg-black border border-zinc-800 space-y-3 relative group hover:border-[#ccff00] transition">
              <div className="text-red-500 font-bold text-sm">LÖGN 03 //</div>
              <h3 className="text-white font-bold text-base leading-snug">
                "Det tar bara 10 minuter i månaden."
              </h3>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Ändå sitter 90% av alla småföretagare klockan 23:30 kvällen före momsdeklarationen med kaffekoppar och ångest och försöker hitta kvitton i skokartonger. Klaro gör det i stunden.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. The "Kvittokrossen" Interactive Terminal */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#ccff00] uppercase font-bold tracking-wider">
              [ KVITTO-EFFEKTEN ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Vad händer när du kastar ett kvitto?
            </h2>
          </div>
          <div className="text-xs font-mono text-zinc-400 max-w-md">
            Testa att klicka på olika utlägg nedan och se hur mycket du skänker bort i onödan till staten om du missar kvittot.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-mono">
          
          {/* Selector buttons */}
          <div className="md:col-span-5 space-y-3">
            {[
              { id: 'coffee', name: 'Kundfika & Bullar', cost: 180, moms: 21.6, rate: '12%', bas: '6072 Repr.' },
              { id: 'laptop', name: 'Arbetsskärm & Tangentbord', cost: 4200, moms: 840, rate: '25%', bas: '5420 IT' },
              { id: 'taxi', name: 'Tågresa till uppdragsgivare', cost: 950, moms: 57, rate: '6%', bas: '5800 Resor' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedReceipt(item.id as any)}
                className={`w-full p-4 border text-left flex items-center justify-between transition cursor-pointer ${
                  selectedReceipt === item.id
                    ? 'border-[#ccff00] bg-[#ccff00]/5 text-white shadow-[4px_4px_0px_#ccff00]'
                    : 'border-zinc-800 bg-[#121419] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white">{item.name}</div>
                  <div className="text-[10px] text-zinc-500">Moms {item.rate} • BAS {item.bas}</div>
                </div>
                <div className="font-black text-sm text-[#ccff00]">
                  {formatSEK(item.cost)}
                </div>
              </button>
            ))}
          </div>

          {/* Machine Readout */}
          <div className="md:col-span-7 bg-[#15171e] border-2 border-zinc-700 p-6 space-y-4 shadow-[6px_6px_0px_#000]">
            
            <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-800 text-zinc-400">
              <span>STATUS: AUTOMATISK TOLKNING</span>
              <span className="text-[#ccff00] font-bold">BFL 7 KAP. GODKÄND</span>
            </div>

            {selectedReceipt === 'coffee' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="text-zinc-300">
                  Om du <strong>slänger kvittot</strong>: Du betalar 180 kr av dina egna skattade pengar.
                </div>
                <div className="p-3 bg-black border border-zinc-800 space-y-1">
                  <div className="flex justify-between text-emerald-400">
                    <span>Momsavdrag återfås direkt:</span>
                    <span className="font-bold">+ 21,60 kr</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Sänkt bolagsskatt / egenavgift:</span>
                    <span className="font-bold">+ 68,00 kr</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-800">
                    <span>Verklig kostnad för dig:</span>
                    <span className="text-[#ccff00]">90,40 kr (Staten tar halva notan!)</span>
                  </div>
                </div>
              </div>
            )}

            {selectedReceipt === 'laptop' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="text-zinc-300">
                  Om du <strong>slänger kvittot</strong>: Du kastar bokstavligen bort <strong>2 200 kr</strong> i skattelättnad.
                </div>
                <div className="p-3 bg-black border border-zinc-800 space-y-1">
                  <div className="flex justify-between text-emerald-400">
                    <span>Momsavdrag återfås direkt (25%):</span>
                    <span className="font-bold">+ 840,00 kr</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Minskat resultat / skattereduktion:</span>
                    <span className="font-bold">+ 1 444,00 kr</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-800">
                    <span>Verklig kostnad för dig:</span>
                    <span className="text-[#ccff00]">1 916,00 kr (Över 50% rabatt via lagen)</span>
                  </div>
                </div>
              </div>
            )}

            {selectedReceipt === 'taxi' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="text-zinc-300">
                  Om du <strong>slänger kvittot</strong>: En tjänsteresa blir ett privat utlägg ur din egen plånbok.
                </div>
                <div className="p-3 bg-black border border-zinc-800 space-y-1">
                  <div className="flex justify-between text-emerald-400">
                    <span>Persontransportmoms (6%):</span>
                    <span className="font-bold">+ 57,00 kr</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Avdragsgill resekostnad:</span>
                    <span className="font-bold">+ 384,00 kr</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-800">
                    <span>Verklig kostnad för dig:</span>
                    <span className="text-[#ccff00]">509,00 kr</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 text-[11px] text-zinc-500">
              → Fota kvittot i Klaro eller vidarebefordra PDF:en via mail. Klaro bokför allt direkt på rätt BAS-konto.
            </div>

          </div>

        </div>

      </section>

      {/* 6. Bankgiro & Open Banking Grid (Handelsbanken, SEB, Swedbank etc) */}
      <section className="py-12 border-y border-zinc-800 bg-[#0a0b0d] px-4 sm:px-8 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#ccff00]" />
            <span className="text-white font-bold">DIREKTKOPPLING MOT SVENSKA BANKER (PSD2):</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-bold">
            <span>Handelsbanken</span>
            <span>•</span>
            <span>Swedbank</span>
            <span>•</span>
            <span>SEB</span>
            <span>•</span>
            <span>Nordea</span>
            <span>•</span>
            <span>Danske Bank</span>
            <span>•</span>
            <span>Länsförsäkringar</span>
          </div>

          <div className="text-zinc-500 text-[10px]">
            Finansinspektionen Godkänd
          </div>
        </div>
      </section>

      {/* 7. Zero Krone Beta Pass (Anti-Paywall) */}
      <section className="py-24 px-4 sm:px-8 max-w-4xl mx-auto text-center font-mono space-y-8">
        
        <div className="inline-block px-3 py-1 bg-[#ccff00]/10 border border-[#ccff00] text-[#ccff00] text-xs font-bold uppercase">
          INGA PENGAR // INGEN BINDNINGSTID // INGET KRÅNGEL
        </div>

        <h2 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tight">
          0 kr under hela betan.
        </h2>

        <p className="text-sm text-zinc-400 max-w-xl mx-auto font-sans leading-relaxed">
          Vi bygger Klaro tillsammans med svenska frilansare och egenföretagare som är trötta på 1990-talets bokföringsprogram. 
          Allt ingår. Exportera SIE-4 filer till din revisor när du vill utan inlåsning.
        </p>

        <div className="p-8 bg-[#14161d] border-2 border-white max-w-lg mx-auto shadow-[8px_8px_0px_#ccff00] text-left space-y-4">
          <div className="flex justify-between items-baseline border-b border-zinc-800 pb-4">
            <div>
              <div className="text-lg font-black text-white">KLARO BETA PASS</div>
              <div className="text-xs text-zinc-400">För Enskild Firma & Aktiebolag</div>
            </div>
            <div className="text-3xl font-black text-[#ccff00]">0 SEK</div>
          </div>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#ccff00]" />
              <span>Realtidsberäkning av lön vs skatteskuld</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#ccff00]" />
              <span>Automatisk kvittotolkning (25%, 12%, 6%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#ccff00]" />
              <span>Godkända A4-fakturor med Bankgiro & OCR</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#ccff00]" />
              <span>Skattekonto 5050-1055 & SIE-4 Export</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onEnterApp}
              className="w-full py-4 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm tracking-wider uppercase transition cursor-pointer"
            >
              STARTA LIVE COCKPIT NU →
            </button>
          </div>
        </div>

      </section>

      {/* 8. Raw Footer */}
      <footer className="border-t border-zinc-800 py-10 px-4 sm:px-8 font-mono text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#ccff00] text-black font-bold text-xs flex items-center justify-center">
              K
            </div>
            <span className="text-zinc-300 font-bold">KLARO TECHNOLOGIES AB</span>
            <span>•</span>
            <span>STOCKHOLM, SVERIGE</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onEnterApp} className="hover:text-white transition">Cockpit</button>
            <button onClick={onOpenDemoTour} className="hover:text-white transition">Snabbdemo</button>
            <span>Bokföringslagen (1999:1078)</span>
            <span>Skatteverket 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
