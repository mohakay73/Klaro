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
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
          Fakturerade Intäkter
        </span>
        <div className="text-2xl font-bold font-mono tracking-tight text-zinc-950 tabular-nums">
          {formatSEK(totalGrossRevenue)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono pt-1">
          <span>Netto exkl. moms:</span>
          <span className="text-zinc-800 font-semibold">{formatSEK(netRevenue)}</span>
        </div>
      </div>

      {/* 2. Utgifter */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
          Företagskostnader (Kvitton)
        </span>
        <div className="text-2xl font-bold font-mono tracking-tight text-zinc-950 tabular-nums">
          {formatSEK(totalGrossExpenses)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono pt-1">
          <span>Avdragsgillt (exkl. moms):</span>
          <span className="text-zinc-800 font-semibold">{formatSEK(deductibleExpenses)}</span>
        </div>
      </div>

      {/* 3. Vinstbas */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
          Rörelseresultat före skatt
        </span>
        <div className="text-2xl font-bold font-mono tracking-tight text-zinc-950 tabular-nums">
          {formatSEK(taxableProfit)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1">
          <span>Skattemässig vinst:</span>
          <span className="text-zinc-800 font-semibold font-mono">{formatSEK(netRevenue - deductibleExpenses)}</span>
        </div>
      </div>

    </div>
  );
}
