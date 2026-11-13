'use client';

import React, { useState } from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { 
  ShieldCheck, 
  HelpCircle, 
  Info,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface SafeToSpendWidgetProps {
  taxBuffer: SwedishTaxBuffer;
  companyType: 'enskild_firma' | 'aktiebolag';
}

export function SafeToSpendWidget({ taxBuffer, companyType }: SafeToSpendWidgetProps) {
  const [copiedBg, setCopiedBg] = useState(false);

  const {
    safeToSpend,
    totalTaxBuffer,
    taxableProfit,
    moms,
    totalFSkattReserve,
    egenavgifter,
    schablonavdrag,
    kommunalskatt,
    nextMomsDeadline,
    nextFSkattDeadline,
  } = taxBuffer;

  const netMomsAmount = Math.max(0, moms.netMoms);
  const totalAllocated = safeToSpend + totalTaxBuffer;

  const safePct = totalAllocated > 0 ? Math.round((safeToSpend / totalAllocated) * 100) : 55;
  const momsPct = totalAllocated > 0 ? Math.round((netMomsAmount / totalAllocated) * 100) : 20;
  const fSkattPct = Math.max(0, 100 - safePct - momsPct);

  const handleCopyBg = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('5050-1055');
    setCopiedBg(true);
    setTimeout(() => setCopiedBg(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-[#e7e2d7] bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(28,25,23,0.03)] space-y-7">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-5 border-b border-[#e7e2d7]/80">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-[#15803d] border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-[#15803d]" />
            <span>Skattekonto Buffert Aktiv</span>
          </span>
          <span className="text-sm text-stone-600 font-medium">
            Anpassad för {companyType === 'enskild_firma' ? 'Enskild Firma (Egenavgifter)' : 'Aktiebolag (Bolagsskatt 20.6%)'}
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm text-stone-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Nästa momsdeklaration:</span>
            <span className="text-[#1c1917] font-bold">{nextMomsDeadline}</span>
          </div>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span>F-skatt dragning:</span>
            <span className="text-[#1c1917] font-bold">{nextFSkattDeadline}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Safe to Spend Hero + Right Physical Skattekonto Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left (7 cols): Safe to Spend Hero Metric */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="uppercase tracking-wider font-extrabold text-xs text-[#15803d] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/70 font-mono">
                Säkert att ta ut
              </span>
              <span className="text-stone-400 font-mono">/ Disponibelt belopp</span>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1c1917] font-mono tabular-nums">
                {formatSEK(safeToSpend)}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#15803d] bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200 shrink-0">
                {safePct}% disponibelt
              </span>
            </div>

            <p className="mt-3 text-sm text-stone-600 leading-relaxed max-w-xl">
              Lagstadgad moms och preliminärskatt har redan avskilts till ditt skattekonto. 
              Detta belopp kan du föra över till ditt personliga bankkonto utan risk för kvarskatt.
            </p>
          </div>

          {/* Tri-color Capital Bar (Stockholm Ochre Theme) */}
          <div className="space-y-3 pt-1">
            <div className="h-4 w-full bg-[#f4efe6] rounded-full overflow-hidden flex border border-[#e7e2d7] shadow-inner">
              <div 
                style={{ width: `${safePct}%` }} 
                className="bg-[#15803d] transition-all duration-300" 
                title={`Safe balance: ${formatSEK(safeToSpend)} (${safePct}%)`}
              />
              <div 
                style={{ width: `${momsPct}%` }} 
                className="bg-[#d97706] transition-all duration-300" 
                title={`VAT/Moms reserve: ${formatSEK(netMomsAmount)} (${momsPct}%)`}
              />
              <div 
                style={{ width: `${fSkattPct}%` }} 
                className="bg-[#57534e] transition-all duration-300" 
                title={`F-skatt buffer: ${formatSEK(totalFSkattReserve)} (${fSkattPct}%)`}
              />
            </div>

            {/* Legend underneath */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono pt-1 text-stone-700">
              <div className="flex items-center gap-2 font-bold text-[#15803d]">
                <span className="w-3 h-3 rounded-xs bg-[#15803d] shrink-0" />
                <span>Disponibelt ({safePct}%)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-[#b45309]">
                <span className="w-3 h-3 rounded-xs bg-[#d97706] shrink-0" />
                <span>Momsreserv ({momsPct}%)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-stone-700">
                <span className="w-3 h-3 rounded-xs bg-[#57534e] shrink-0" />
                <span>F-skatt ({fSkattPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Signature "Klaro Skattekonto Card" (Warm Espresso Theme) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917] p-6 text-white border border-stone-700/60 shadow-[0_16px_32px_-8px_rgba(28,25,23,0.35)] overflow-hidden transition-all duration-300">
            
            {/* Subtle Golden Sheen */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

            {/* Card Header */}
            <div className="relative flex items-center justify-between pb-6">
              <span className="font-serif sm:font-sans font-bold text-lg tracking-tight text-[#f7eedc] drop-shadow-xs">
                Klaro Skattekonto
              </span>
              <div className="w-7 h-5 rounded bg-gradient-to-tr from-amber-300/40 to-amber-200/10 border border-amber-400/40 flex items-center justify-center">
                <div className="w-4 h-3 rounded-xs border border-amber-300/40 opacity-70" />
              </div>
            </div>

            {/* Card Content & Details */}
            <div className="relative space-y-4">
              <div>
                <div className="text-stone-200 font-semibold text-sm tracking-wide">
                  {companyType === 'enskild_firma' ? 'Mohak Konsulting EF' : 'Nordic Tech Solutions AB'}
                </div>
                <button
                  type="button"
                  onClick={handleCopyBg}
                  className="mt-1 flex items-center gap-1.5 text-xs text-amber-300/90 font-mono hover:text-white transition group cursor-pointer"
                  title="Klicka för att kopiera Bankgiro"
                >
                  <span>Bankgiro 5050-1055</span>
                  {copiedBg ? (
                    <Check className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-amber-400/70 group-hover:text-amber-300" />
                  )}
                </button>
              </div>

              {/* Skattekonto Buffert amount */}
              <div className="pt-2 border-t border-stone-800 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-amber-300/80 font-mono uppercase tracking-wider block">
                    Skattekonto Buffert
                  </span>
                  <div className="text-xl font-bold font-mono text-[#f7eedc] tabular-nums tracking-tight">
                    {formatSEK(totalTaxBuffer)}
                  </div>
                </div>

                {/* Mobilt BankID Verifierad Hologram Seal */}
                <div className="bg-white/95 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm border border-white/40">
                  <div className="w-4 h-4 rounded-xs bg-[#0b2447] flex items-center justify-center font-bold text-[9px] text-white">
                    ID
                  </div>
                  <div className="text-[10px] leading-tight text-[#0b2447] font-bold">
                    <span>BankID</span>
                    <span className="block text-[8px] font-normal text-emerald-800">Verifierad</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sub-breakdown under the card */}
          <div className="mt-3 flex items-center justify-between text-xs px-2 text-stone-500 font-mono">
            <span>Momsreserv: <strong className="text-stone-800">{formatSEK(netMomsAmount)}</strong></span>
            <span>•</span>
            <span>F-skatt: <strong className="text-stone-800">{formatSEK(totalFSkattReserve)}</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
