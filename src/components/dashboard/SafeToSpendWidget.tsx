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
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-7">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Skattekonto Buffert Aktiv</span>
          </span>
          <span className="text-sm text-zinc-600 font-medium">
            Anpassad för {companyType === 'enskild_firma' ? 'Enskild Firma (Egenavgifter)' : 'Aktiebolag (Bolagsskatt 20.6%)'}
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Nästa momsdeklaration:</span>
            <span className="text-zinc-950 font-bold">{nextMomsDeadline}</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span>F-skatt dragning:</span>
            <span className="text-zinc-950 font-bold">{nextFSkattDeadline}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Safe to Spend Hero + Right Physical Skattekonto Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left (7 cols): Safe to Spend Hero Metric */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="uppercase tracking-wider font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/70">
                Säkert att ta ut
              </span>
              <span className="text-zinc-400 font-mono">/ Disponibelt belopp</span>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 font-mono tabular-nums">
                {formatSEK(safeToSpend)}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200 shrink-0">
                {safePct}% disponibelt
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-600 leading-relaxed max-w-xl">
              Lagstadgad moms och preliminärskatt har redan avskilts till ditt skattekonto. 
              Detta belopp kan du föra över till ditt personliga bankkonto utan risk för kvarskatt.
            </p>
          </div>

          {/* Tri-color Capital Bar (Mockup Style) */}
          <div className="space-y-3 pt-1">
            <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/80 shadow-inner">
              <div 
                style={{ width: `${safePct}%` }} 
                className="bg-[#059669] transition-all duration-300" 
                title={`Safe balance: ${formatSEK(safeToSpend)} (${safePct}%)`}
              />
              <div 
                style={{ width: `${momsPct}%` }} 
                className="bg-[#f59e0b] transition-all duration-300" 
                title={`VAT/Moms reserve: ${formatSEK(netMomsAmount)} (${momsPct}%)`}
              />
              <div 
                style={{ width: `${fSkattPct}%` }} 
                className="bg-[#334155] transition-all duration-300" 
                title={`F-skatt buffer: ${formatSEK(totalFSkattReserve)} (${fSkattPct}%)`}
              />
            </div>

            {/* Legend underneath */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono pt-1 text-zinc-700">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-[#059669] shrink-0" />
                <span>Safe balance ({safePct}%)</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-[#f59e0b] shrink-0" />
                <span>VAT/Moms reserve ({momsPct}%)</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-[#334155] shrink-0" />
                <span>F-skatt buffer ({fSkattPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): The Signature "Klaro Skattekonto Card" (Mockup Object) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0c3123] via-[#09291d] to-[#051a12] p-6 text-white border border-emerald-700/50 shadow-[0_16px_32px_-8px_rgba(10,49,35,0.4)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-8px_rgba(10,49,35,0.5)]">
            
            {/* Subtle Metallic Corner Sheen */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-36 h-36 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

            {/* Card Header */}
            <div className="relative flex items-center justify-between pb-6">
              <span className="font-serif sm:font-sans font-bold text-lg tracking-tight text-[#f1e5c8] drop-shadow-xs">
                Klaro Skattekonto
              </span>
              <div className="w-7 h-5 rounded bg-gradient-to-tr from-amber-200/30 to-amber-100/10 border border-amber-300/30 flex items-center justify-center">
                <div className="w-4 h-3 rounded-xs border border-amber-300/40 opacity-70" />
              </div>
            </div>

            {/* Card Content & Details */}
            <div className="relative space-y-4">
              <div>
                <div className="text-emerald-100 font-semibold text-sm tracking-wide">
                  {companyType === 'enskild_firma' ? 'Mohak Konsulting EF' : 'Nordic Tech Solutions AB'}
                </div>
                <button
                  type="button"
                  onClick={handleCopyBg}
                  className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300/80 font-mono hover:text-white transition group"
                  title="Klicka för att kopiera Bankgiro"
                >
                  <span>Bankgiro 5050-1055</span>
                  {copiedBg ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-300" />
                  )}
                </button>
              </div>

              {/* Skattekonto Buffert amount */}
              <div className="pt-2 border-t border-emerald-800/60 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300/70 font-mono uppercase tracking-wider block">
                    Skattekonto Buffert
                  </span>
                  <div className="text-xl font-bold font-mono text-[#f1e5c8] tabular-nums tracking-tight">
                    {formatSEK(totalTaxBuffer)}
                  </div>
                </div>

                {/* Mobilt BankID Verifierad Hologram Seal */}
                <div className="bg-white/95 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm border border-white/40">
                  {/* BankID Ribbon Icon */}
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
          <div className="mt-3 flex items-center justify-between text-xs px-2 text-zinc-500 font-mono">
            <span>Momsreserv: <strong className="text-zinc-800">{formatSEK(netMomsAmount)}</strong></span>
            <span>•</span>
            <span>F-skatt: <strong className="text-zinc-800">{formatSEK(totalFSkattReserve)}</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
