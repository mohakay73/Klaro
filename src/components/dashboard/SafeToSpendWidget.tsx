'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle, 
  ArrowUpRight, 
  Calendar, 
  Percent, 
  Sparkles,
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
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 md:p-8 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              Skatteverket-skyddad
            </span>
            <span className="text-xs text-zinc-400">
              Realtidsberäknad för {companyType === 'enskild_firma' ? 'Enskild Firma' : 'Aktiebolag'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Nästa moms: <strong className="text-zinc-200">{nextMomsDeadline}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>F-skatt: <strong className="text-zinc-200">{nextFSkattDeadline}</strong></span>
            </div>
          </div>
        </div>

        {/* Main Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          
          {/* Left Column: SÄKERT ATT TA UT (Hero Metric) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Säkert att ta ut (Disponibelt)
                </h3>
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-pointer" />
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 shadow-xl z-50">
                    Detta är dina oskattade vinster minus alla lagstadgade skattereserver (Moms + Egenavgifter + Preliminärskatt). Detta kan du tryggt ta ut till ditt privatkonto utan risk för skattesmäll.
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white font-mono tracking-tight">
                  {formatSEK(safeToSpend)}
                </span>
                <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {safePct}% av vinsten
                </span>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Alla momsskulder och uppskattade sociala avgifter har räknats bort. 
                Detta belopp kan du föra över till ditt privatkonto idag.
              </p>
            </div>

            {/* Visual breakdown progress bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Ekonomisk fördelning</span>
                <span className="font-mono text-zinc-300">Totalt resultat: {formatSEK(taxableProfit)}</span>
              </div>

              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${safePct}%` }} 
                  className="bg-emerald-500 transition-all duration-500" 
                  title={`Säkert att ta ut: ${formatSEK(safeToSpend)} (${safePct}%)`}
                />
                <div 
                  style={{ width: `${momsPct}%` }} 
                  className="bg-amber-500 transition-all duration-500" 
                  title={`Momsreserv: ${formatSEK(netMomsAmount)} (${momsPct}%)`}
                />
                <div 
                  style={{ width: `${fSkattPct}%` }} 
                  className="bg-sky-500 transition-all duration-500" 
                  title={`F-skatt / Egenavgifter: ${formatSEK(totalFSkattReserve)} (${fSkattPct}%)`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-300">Disponibelt ({safePct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-zinc-300">Momsreserv ({momsPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-zinc-300">
                    {companyType === 'enskild_firma' ? 'F-skatt & Egenavgifter' : 'Bolagsskatt (20.6%)'} ({fSkattPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: SKATTEBUFFERT BREAKDOWN */}
          <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Reserverat för Skatteverket
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">Låt stå på skattekontot / buffertkontot</p>
              </div>
              <span className="text-xl font-bold font-mono text-white">
                {formatSEK(totalTaxBuffer)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* 1. Net Moms */}
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800/80">
                <div>
                  <div className="font-medium text-zinc-200 flex items-center gap-1">
                    <span>Momsreserv (Netto moms)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ML
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Utgående ({formatSEK(moms.utgaendeMoms)}) - Ingående ({formatSEK(moms.ingaendeMoms)})
                  </span>
                </div>
                <span className="font-mono font-semibold text-amber-300">
                  {formatSEK(netMomsAmount)}
                </span>
              </div>

              {/* 2. Egenavgifter / Bolagsskatt */}
              {companyType === 'enskild_firma' ? (
                <>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <div>
                      <div className="font-medium text-zinc-200">Egenavgifter (~28.97%)</div>
                      <span className="text-[11px] text-zinc-500">
                        Baserat på vinst efter 25% schablonavdrag ({formatSEK(schablonavdrag)})
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-sky-300">
                      {formatSEK(egenavgifter)}
                    </span>
                  </div>

                  {/* 3. Kommunalskatt */}
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <div>
                      <div className="font-medium text-zinc-200">Preliminärskatt (Kommunalskatt ~32%)</div>
                      <span className="text-[11px] text-zinc-500">
                        Inkomstskatt på vinst efter egenavgifter
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-sky-300">
                      {formatSEK(kommunalskatt)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800/80">
                  <div>
                    <div className="font-medium text-zinc-200">Bolagsskatt (20.6%)</div>
                    <span className="text-[11px] text-zinc-500">
                      Statlig bolagsskatt på aktiebolagets vinst
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-sky-300">
                    {formatSEK(totalFSkattReserve)}
                  </span>
                </div>
              )}

            </div>

            {/* Note on Skatteverket buffer */}
            <div className="pt-1 flex items-start gap-2 text-[11px] text-zinc-400">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
              <span>
                Bufferten dras automatiskt av så fort du laddar upp nya kvitton eller lägger till fakturor.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
