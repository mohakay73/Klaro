'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { 
  ShieldCheck, 
  HelpCircle, 
  Info,
  ArrowUpRight,
  TrendingUp,
  Lock
} from 'lucide-react';

interface SafeToSpendWidgetProps {
  taxBuffer: SwedishTaxBuffer;
  companyType: 'enskild_firma' | 'aktiebolag';
}

export function SafeToSpendWidget({ taxBuffer, companyType }: SafeToSpendWidgetProps) {
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

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Skattekonto Buffert Aktiv</span>
          </span>
          <span className="text-xs text-zinc-500 font-medium">
            Anpassad för {companyType === 'enskild_firma' ? 'Enskild Firma (Egenavgifter)' : 'Aktiebolag (Bolagsskatt 20.6%)'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Nästa momsdeklaration:</span>
            <span className="text-zinc-900 font-bold">{nextMomsDeadline}</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span>F-skatt dragning:</span>
            <span className="text-zinc-900 font-bold">{nextFSkattDeadline}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Safe to Spend Hero Metric */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="uppercase tracking-wider font-extrabold text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                Säkert att ta ut
              </span>
              <span className="text-zinc-400 font-mono">/ Disponibel kassa</span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-950 font-mono tabular-nums">
                {formatSEK(safeToSpend)}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {safePct}% av vinsten
              </span>
            </div>

            <p className="mt-3 text-xs text-zinc-600 leading-relaxed max-w-lg">
              Lagstadgad moms och preliminärskatt har redan avskilts. 
              Detta belopp kan säkert föras över till ditt personliga bankkonto utan risk för kvarskatt vid nästa deklaration.
            </p>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-sans font-bold">
                Kapitalfördelning i Klaro
              </span>
              <span className="text-zinc-800 font-semibold">Rörelsevinst: {formatSEK(taxableProfit)}</span>
            </div>

            <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/80 shadow-inner">
              <div 
                style={{ width: `${safePct}%` }} 
                className="bg-emerald-600 transition-all duration-300" 
                title={`Disponibelt: ${formatSEK(safeToSpend)} (${safePct}%)`}
              />
              <div 
                style={{ width: `${momsPct}%` }} 
                className="bg-amber-400 transition-all duration-300" 
                title={`Momsreserv: ${formatSEK(netMomsAmount)} (${momsPct}%)`}
              />
              <div 
                style={{ width: `${fSkattPct}%` }} 
                className="bg-zinc-800 transition-all duration-300" 
                title={`F-skatt: ${formatSEK(totalFSkattReserve)} (${fSkattPct}%)`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-zinc-700">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 shrink-0" />
                <span>Säkert privat ({safePct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shrink-0" />
                <span>Momsreserv ({momsPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 shrink-0" />
                <span>F-skatt & Egenavgifter ({fSkattPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tax Buffer Ledger */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Reserverat i Skattebuffert
                </span>
              </div>
              <span className="text-lg font-black font-mono text-zinc-950 tabular-nums">
                {formatSEK(totalTaxBuffer)}
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-3 text-xs font-mono">
              
              {/* Net Moms */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-700 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Momsreserv (Skatteverket):</span>
                </div>
                <span className="text-zinc-950 font-bold tabular-nums">
                  {formatSEK(netMomsAmount)}
                </span>
              </div>

              {/* F-skatt / Egenavgifter header */}
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-700 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-zinc-800" />
                  <span>F-skatt reserv:</span>
                </div>
                <span className="text-zinc-950 font-bold tabular-nums">{formatSEK(totalFSkattReserve)}</span>
              </div>

              {/* Sub-breakdown */}
              {companyType === 'enskild_firma' && (
                <div className="pl-3.5 space-y-1.5 text-[11px] text-zinc-600 border-l-2 border-zinc-200 font-sans">
                  <div className="flex justify-between">
                    <span>Egenavgifter (28.97%):</span>
                    <span className="font-mono text-zinc-800 font-semibold tabular-nums">{formatSEK(egenavgifter)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schablonavdrag (-25%):</span>
                    <span className="font-mono text-zinc-800 font-semibold tabular-nums">-{formatSEK(schablonavdrag)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kommunalskatt (~32%):</span>
                    <span className="font-mono text-zinc-800 font-semibold tabular-nums">{formatSEK(kommunalskatt)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer reassurance */}
            <div className="pt-2 border-t border-zinc-200 flex items-center gap-1.5 text-[11px] text-emerald-800 font-sans font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Full täckning mot kvarskatt vid revision.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
