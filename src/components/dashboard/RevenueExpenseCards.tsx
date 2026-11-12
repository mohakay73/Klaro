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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* 1. Intäkter */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-2.5 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
          Fakturerade Intäkter
        </span>
        <div className="text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums">
          {formatSEK(totalGrossRevenue)}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-mono pt-1">
          <span>Netto exkl. moms:</span>
          <span className="text-zinc-900 font-bold">{formatSEK(netRevenue)}</span>
        </div>
      </div>

      {/* 2. Utgifter */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-2.5 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
          Företagskostnader (Kvitton)
        </span>
        <div className="text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums">
          {formatSEK(totalGrossExpenses)}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-mono pt-1">
          <span>Avdragsgillt (exkl. moms):</span>
          <span className="text-zinc-900 font-bold">{formatSEK(deductibleExpenses)}</span>
        </div>
      </div>

      {/* 3. Vinstbas */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-2.5 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
          Rörelseresultat före skatt
        </span>
        <div className="text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums">
          {formatSEK(taxableProfit)}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 pt-1">
          <span>Skattemässig vinst:</span>
          <span className="text-zinc-900 font-bold font-mono">{formatSEK(netRevenue - deductibleExpenses)}</span>
        </div>
      </div>

    </div>
  );
}
