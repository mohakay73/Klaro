'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { 
  ShieldCheck, 
  HelpCircle, 
  Info
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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Skattekonto Buffert</span>
          </span>
          <span className="text-xs text-zinc-500">
            Beräknad för {companyType === 'enskild_firma' ? 'Enskild Firma' : 'Aktiebolag'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Nästa moms:</span>
            <span className="text-zinc-800 font-semibold">{nextMomsDeadline}</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span>F-skatt:</span>
            <span className="text-zinc-800 font-semibold">{nextFSkattDeadline}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* Left: Safe to Spend Metric */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="uppercase tracking-wider font-semibold text-[11px] text-zinc-500">
                Säkert att ta ut
              </span>
              <span className="text-zinc-400 font-mono">/ Disponibelt belopp</span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 font-mono tabular-nums">
                {formatSEK(safeToSpend)}
              </span>
              <span className="text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                {safePct}% av vinsten
              </span>
            </div>

            <p className="mt-2.5 text-xs text-zinc-600 leading-relaxed max-w-lg">
              Moms och beräknad preliminärskatt är skyddade i bufferten. 
              Detta överskott kan föras över till ditt privatkonto utan risk för kvarskatt vid deklaration.
            </p>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-sans font-medium">
                Kapitalfördelning
              </span>
              <span className="text-zinc-700 font-medium">Rörelsevinst: {formatSEK(taxableProfit)}</span>
            </div>

            <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/60">
              <div 
                style={{ width: `${safePct}%` }} 
                className="bg-emerald-600 transition-all duration-300" 
                title={`Disponibelt: ${formatSEK(safeToSpend)} (${safePct}%)`}
              />
              <div 
                style={{ width: `${momsPct}%` }} 
                className="bg-zinc-400 transition-all duration-300" 
                title={`Momsreserv: ${formatSEK(netMomsAmount)} (${momsPct}%)`}
              />
              <div 
                style={{ width: `${fSkattPct}%` }} 
                className="bg-zinc-800 transition-all duration-300" 
                title={`F-skatt: ${formatSEK(totalFSkattReserve)} (${fSkattPct}%)`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-zinc-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 shrink-0" />
                <span>Säkert uttag ({safePct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400 shrink-0" />
                <span>Momsreserv ({momsPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 shrink-0" />
                <span>F-skatt ({fSkattPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tax Buffer Ledger */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Reserverat för Skatteverket
              </span>
              <span className="text-base font-bold font-mono text-zinc-950 tabular-nums">
                {formatSEK(totalTaxBuffer)}
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-2.5 text-xs font-mono">
              
              {/* Net Moms */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-600 font-sans">
                  <span>Momsreserv (Netto):</span>
                  <span title="Utgående moms minus avdragsgill moms på kvitton">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </div>
                <span className="text-zinc-900 font-semibold tabular-nums">
                  {formatSEK(netMomsAmount)}
                </span>
              </div>

              {/* F-skatt / Egenavgifter header */}
              <div className="pt-2 border-t border-zinc-200/70 flex items-center justify-between font-semibold">
                <span className="text-zinc-700 font-sans">F-skatt & Egenavgifter:</span>
                <span className="text-zinc-950 tabular-nums">{formatSEK(totalFSkattReserve)}</span>
              </div>

              {/* Sub-breakdown */}
              {companyType === 'enskild_firma' && (
                <div className="pl-3 space-y-1 text-[11px] text-zinc-500 border-l border-zinc-200">
                  <div className="flex justify-between">
                    <span>Egenavgifter (28.97%):</span>
                    <span className="text-zinc-700 tabular-nums">{formatSEK(egenavgifter)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schablonavdrag (-25%):</span>
                    <span className="text-zinc-700 tabular-nums">-{formatSEK(schablonavdrag)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kommunalskatt (~32%):</span>
                    <span className="text-zinc-700 tabular-nums">{formatSEK(kommunalskatt)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer reassurance */}
            <div className="pt-2 border-t border-zinc-200/80 flex items-center gap-1.5 text-[11px] text-zinc-500 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span>Full täckning för moms & egenavgifter.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
