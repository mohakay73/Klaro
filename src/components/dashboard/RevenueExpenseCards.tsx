'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { TrendingUp, TrendingDown, Landmark, Sparkles } from 'lucide-react';

interface RevenueExpenseCardsProps {
  taxBuffer: SwedishTaxBuffer;
}

export function RevenueExpenseCards({ taxBuffer }: RevenueExpenseCardsProps) {
  const {
    totalGrossRevenue,
    netRevenue,
    totalGrossExpenses,
    deductibleExpenses,
    taxableProfit,
  } = taxBuffer;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* 1. Intäkter (Revenue) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Totala Intäkter (Fakturering)</span>
          <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white">
            {formatSEK(totalGrossRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span>Netto (exkl. moms):</span>
            <span className="font-mono text-zinc-200 font-semibold">{formatSEK(netRevenue)}</span>
          </div>
        </div>
      </div>

      {/* 2. Utgifter / Kostnader (Expenses) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Företagskostnader (Kvitton)</span>
          <span className="p-1 rounded bg-rose-500/10 text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white">
            {formatSEK(totalGrossExpenses)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span>Avdragsgillt (exkl. moms):</span>
            <span className="font-mono text-zinc-200 font-semibold">{formatSEK(deductibleExpenses)}</span>
          </div>
        </div>
      </div>

      {/* 3. Rörelseresultat (Profit) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Resultat före skatt (Vinst)</span>
          <span className="p-1 rounded bg-sky-500/10 text-sky-400">
            <Landmark className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white">
            {formatSEK(taxableProfit)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span>Skattemässig vinstbas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
              Netto intäkt - kostnad
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
