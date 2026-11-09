'use client';

import React from 'react';
import { MomsCalculation } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { FileText, ArrowRight, ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';

interface MomsSummaryCardProps {
  moms: MomsCalculation;
}

export function MomsSummaryCard({ moms }: MomsSummaryCardProps) {
  const { utgaendeMoms, ingaendeMoms, netMoms, utgaendeBreakdown, ingaendeBreakdown, status } = moms;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">
            Momsdeklaration (Skatteverket)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400">Netto momsläge:</span>
          {status === 'to_pay' ? (
            <span className="px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Att betala: {formatSEK(netMoms)}
            </span>
          ) : status === 'refund' ? (
            <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Att få tillbaka: {formatSEK(Math.abs(netMoms))}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-300">
              I balans (0 kr)
            </span>
          )}
        </div>
      </div>

      {/* Top 3 Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Utgående moms */}
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Utgående moms (Försäljning)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-zinc-200">
            {formatSEK(utgaendeMoms)}
          </div>
          <span className="text-[11px] text-zinc-500">Moms du tagit betalt för</span>
        </div>

        {/* Ingående moms */}
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ingående moms (Kvitton)</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-emerald-400">
            -{formatSEK(ingaendeMoms)}
          </div>
          <span className="text-[11px] text-zinc-500">Avdragsgill moms på utgifter (Ruta 48)</span>
        </div>

        {/* Net moms buffer */}
        <div className={`p-3 rounded-lg border ${
          status === 'to_pay' ? 'bg-amber-950/20 border-amber-800/40' : 'bg-zinc-950/70 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Att inbetala till Skatteverket</span>
            <FileText className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-amber-300">
            {formatSEK(Math.max(0, netMoms))}
          </div>
          <span className="text-[11px] text-zinc-500">Reserveras på skattekontot</span>
        </div>
      </div>

      {/* Moms Brackets Breakdown according to Swedish Skatteverket Boxes */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Svenska Momssatser & Skatteverkets Rutor
        </h5>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          
          {/* 25% */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">25% Moms</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                Ruta 05
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">SaaS, IT, Tjänster</p>
            <div className="mt-2 space-y-0.5 font-mono text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Utg:</span>
                <span className="text-zinc-200">{formatSEK(utgaendeBreakdown[25]?.vatAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ing:</span>
                <span className="text-emerald-400">{formatSEK(ingaendeBreakdown[25]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 12% */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">12% Moms</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                Ruta 06
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Restaurang, Hotell</p>
            <div className="mt-2 space-y-0.5 font-mono text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Utg:</span>
                <span className="text-zinc-200">{formatSEK(utgaendeBreakdown[12]?.vatAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ing:</span>
                <span className="text-emerald-400">{formatSEK(ingaendeBreakdown[12]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 6% */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">6% Moms</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                Ruta 07
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Tåg, Taxi, Böcker</p>
            <div className="mt-2 space-y-0.5 font-mono text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Utg:</span>
                <span className="text-zinc-200">{formatSEK(utgaendeBreakdown[6]?.vatAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ing:</span>
                <span className="text-emerald-400">{formatSEK(ingaendeBreakdown[6]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 0% */}
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">0% Momsfri</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                Ruta 08
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Bank, Finans, Friskvård</p>
            <div className="mt-2 space-y-0.5 font-mono text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Underlag:</span>
                <span className="text-zinc-300">{formatSEK((utgaendeBreakdown[0]?.netBase || 0) + (ingaendeBreakdown[0]?.netBase || 0))}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Moms:</span>
                <span className="text-zinc-500">0 kr</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
