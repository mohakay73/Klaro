'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { 
  ShieldCheck, 
  HelpCircle, 
  Calendar, 
  Info,
  ArrowUpRight
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
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-7">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Skattekonto Buffert</span>
          </span>
          <span className="text-xs text-zinc-500">
            Beräknad för {companyType === 'enskild_firma' ? 'Enskild Firma' : 'Aktiebolag'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Nästa moms:</span>
            <span className="text-zinc-200">{nextMomsDeadline}</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">F-skatt:</span>
            <span className="text-zinc-200">{nextFSkattDeadline}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* Left: Safe to Spend Metric */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="uppercase tracking-wider font-medium text-[11px] text-zinc-400">
                Säkert att ta ut
              </span>
              <span className="text-zinc-500 font-mono">/ Disponibelt belopp</span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-white font-mono tabular-nums">
                {formatSEK(safeToSpend)}
              </span>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/60">
                {safePct}% av vinsten
              </span>
            </div>

            <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed max-w-lg">
              Lagstadgad moms och uppskattad preliminärskatt har reserverats. 
              Detta överskott kan föras över till ditt privatkonto utan risk för kvarskatt.
            </p>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-sans">
                Kapitalfördelning
              </span>
              <span className="text-zinc-400">Rörelsevinst: {formatSEK(taxableProfit)}</span>
            </div>

            <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${safePct}%` }} 
                className="bg-emerald-500/80 transition-all duration-300" 
                title={`Disponibelt: ${formatSEK(safeToSpend)} (${safePct}%)`}
              />
              <div 
                style={{ width: `${momsPct}%` }} 
                className="bg-zinc-400 transition-all duration-300" 
                title={`Momsreserv: ${formatSEK(netMomsAmount)} (${momsPct}%)`}
              />
              <div 
                style={{ width: `${fSkattPct}%` }} 
                className="bg-zinc-600 transition-all duration-300" 
                title={`F-skatt: ${formatSEK(totalFSkattReserve)} (${fSkattPct}%)`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                <span className="text-zinc-300">Disponibelt ({safePct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">Momsreserv ({momsPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="text-zinc-300">
                  {companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt'} ({fSkattPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Skatteverket Reserve Breakdown Ledger */}
        <div className="lg:col-span-5 rounded-lg border border-zinc-800/70 bg-zinc-950/60 p-4 space-y-3.5">
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-300 block">
                Reserverat för Skatteverket
              </span>
              <span className="text-[11px] text-zinc-500">Står kvar på skattekontot</span>
            </div>
            <span className="text-lg font-bold font-mono text-zinc-100 tabular-nums">
              {formatSEK(totalTaxBuffer)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            
            {/* Moms */}
            <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-900/40 border border-zinc-800/40">
              <div>
                <span className="font-medium text-zinc-300 block">Momsreserv (Netto)</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Utgående ({formatSEK(moms.utgaendeMoms)}) - Ingående ({formatSEK(moms.ingaendeMoms)})
                </span>
              </div>
              <span className="font-mono font-medium text-zinc-200 tabular-nums">
                {formatSEK(netMomsAmount)}
              </span>
            </div>

            {/* Egenavgifter & F-skatt */}
            {companyType === 'enskild_firma' ? (
              <>
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-900/40 border border-zinc-800/40">
                  <div>
                    <span className="font-medium text-zinc-300 block">Egenavgifter (~28,97%)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Efter 25% schablonavdrag ({formatSEK(schablonavdrag)})
                    </span>
                  </div>
                  <span className="font-mono font-medium text-zinc-200 tabular-nums">
                    {formatSEK(egenavgifter)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-900/40 border border-zinc-800/40">
                  <div>
                    <span className="font-medium text-zinc-300 block">Preliminärskatt (~32%)</span>
                    <span className="text-[10px] text-zinc-500">
                      Kommunalskatt på vinst efter sociala avgifter
                    </span>
                  </div>
                  <span className="font-mono font-medium text-zinc-200 tabular-nums">
                    {formatSEK(kommunalskatt)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-900/40 border border-zinc-800/40">
                <div>
                  <span className="font-medium text-zinc-300 block">Bolagsskatt (20,6%)</span>
                  <span className="text-[10px] text-zinc-500">
                    Statlig inkomstskatt för aktiebolag
                  </span>
                </div>
                <span className="font-mono font-medium text-zinc-200 tabular-nums">
                  {formatSEK(totalFSkattReserve)}
                </span>
              </div>
            )}

          </div>

          <div className="pt-1 text-[11px] text-zinc-500 flex items-center gap-1.5 border-t border-zinc-800/40">
            <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>Bufferten justeras automatiskt i realtid vid varje nytt kvitto.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
