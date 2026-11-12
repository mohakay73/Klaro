'use client';

import React from 'react';
import { MomsCalculation } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { Scale, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface MomsSummaryCardProps {
  moms: MomsCalculation;
}

export function MomsSummaryCard({ moms }: MomsSummaryCardProps) {
  const { utgaendeMoms, ingaendeMoms, netMoms, utgaendeBreakdown, ingaendeBreakdown, status } = moms;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-zinc-500" />
          <h4 className="text-base font-bold text-zinc-950">
            Momsdeklaration (Skatteverket)
          </h4>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="text-zinc-500 text-sm font-sans font-medium">Netto moms:</span>
          {status === 'to_pay' ? (
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              Att inbetala: {formatSEK(netMoms)}
            </span>
          ) : status === 'refund' ? (
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
              Återbetalning: {formatSEK(Math.abs(netMoms))}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              I balans (0 kr)
            </span>
          )}
        </div>
      </div>

      {/* Top 3 Metric Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Utgående moms */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-zinc-700">
            <span className="font-semibold">Utgående moms (Försäljning)</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 tabular-nums">
            {formatSEK(utgaendeMoms)}
          </div>
          <span className="text-xs text-zinc-500 block">Moms uppburen från kunder</span>
        </div>

        {/* Ingående moms */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-zinc-700">
            <span className="font-semibold">Ingående moms (Kvitton)</span>
            <ArrowDownLeft className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 tabular-nums">
            -{formatSEK(ingaendeMoms)}
          </div>
          <span className="text-xs text-zinc-500 block">Avdragsgill skatt på utgifter (Ruta 48)</span>
        </div>

        {/* Netto */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-zinc-700">
            <span className="font-semibold">Att avräkna Skatteverket</span>
            <span className="text-xs font-mono text-zinc-500 font-bold">Ruta 49</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 tabular-nums">
            {formatSEK(Math.max(0, netMoms))}
          </div>
          <span className="text-xs text-zinc-500 block">Reserverat på skattekontot</span>
        </div>

      </div>

      {/* Skatteverkets Rutor Breakdown */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
          Underlag per momssats & Skatteverkets Rutor
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          
          {/* 25% */}
          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">25% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-mono font-semibold">
                Ruta 05
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Underlag:</span>
                <span className="text-zinc-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[25]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Skatt (Ruta 10):</span>
                <span className="text-zinc-950 font-bold tabular-nums">{formatSEK(utgaendeBreakdown[25]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 12% */}
          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">12% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-mono font-semibold">
                Ruta 06
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Underlag:</span>
                <span className="text-zinc-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[12]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Skatt (Ruta 11):</span>
                <span className="text-zinc-950 font-bold tabular-nums">{formatSEK(utgaendeBreakdown[12]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 6% */}
          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">6% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-mono font-semibold">
                Ruta 07
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Underlag:</span>
                <span className="text-zinc-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[6]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Skatt (Ruta 12):</span>
                <span className="text-zinc-950 font-bold tabular-nums">{formatSEK(utgaendeBreakdown[6]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 0% */}
          <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">0% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-mono font-semibold">
                Momsfritt
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Underlag:</span>
                <span className="text-zinc-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[0]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Skatt:</span>
                <span className="text-zinc-950 font-bold tabular-nums">0 kr</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
