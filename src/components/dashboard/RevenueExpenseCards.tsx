'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { formatSEK } from '@/lib/utils';

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
      
      {/* 1. Intäkter */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
          Fakturerade Intäkter
        </span>
        <div className="text-2xl font-semibold font-mono tracking-tight text-zinc-100 tabular-nums">
          {formatSEK(totalGrossRevenue)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono pt-1">
          <span className="text-zinc-500">Netto exkl. moms:</span>
          <span className="text-zinc-300 font-medium">{formatSEK(netRevenue)}</span>
        </div>
      </div>

      {/* 2. Utgifter */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
          Företagskostnader (Kvitton)
        </span>
        <div className="text-2xl font-semibold font-mono tracking-tight text-zinc-100 tabular-nums">
          {formatSEK(totalGrossExpenses)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono pt-1">
          <span className="text-zinc-500">Avdragsgillt (exkl. moms):</span>
          <span className="text-zinc-300 font-medium">{formatSEK(deductibleExpenses)}</span>
        </div>
      </div>

      {/* 3. Vinstbas */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
          Rörelseresultat före skatt
        </span>
        <div className="text-2xl font-semibold font-mono tracking-tight text-zinc-100 tabular-nums">
          {formatSEK(taxableProfit)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
          <span className="text-zinc-500">Skattemässig vinst:</span>
          <span className="text-zinc-300 font-medium font-mono">{formatSEK(netRevenue - deductibleExpenses)}</span>
        </div>
      </div>

    </div>
  );
}
