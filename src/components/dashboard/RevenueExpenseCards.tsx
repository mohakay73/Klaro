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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      
      {/* 1. Fakturerade Intäkter */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
            Fakturerade Intäkter:
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums mt-1">
            {formatSEK(totalGrossRevenue)}
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-1">
            Netto exkl. moms: <strong className="text-zinc-900 font-semibold">{formatSEK(netRevenue)}</strong>
          </div>
        </div>

        {/* Elegant Emerald Trend Sparkline */}
        <div className="pt-2">
          <svg className="w-full h-8 sm:h-9 stroke-emerald-600 fill-none" viewBox="0 0 200 40">
            <path
              d="M 0 32 Q 30 35, 60 22 T 120 18 T 160 26 T 200 12"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Avdragsgilla Kostnader */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
            Avdragsgilla Kostnader:
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums mt-1">
            {formatSEK(totalGrossExpenses)}
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-1">
            Exkl. moms: <strong className="text-zinc-900 font-semibold">{formatSEK(deductibleExpenses)}</strong>
          </div>
        </div>

        {/* Elegant Amber Trend Sparkline */}
        <div className="pt-2">
          <svg className="w-full h-8 sm:h-9 stroke-amber-500 fill-none" viewBox="0 0 200 40">
            <path
              d="M 0 28 Q 40 18, 70 30 T 130 16 T 170 28 T 200 20"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Rörelsevinst */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden sm:col-span-2 md:col-span-1">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
            Rörelsevinst:
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums mt-1">
            {formatSEK(taxableProfit)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Skattemässig vinst: <strong className="text-zinc-900 font-mono font-semibold">{formatSEK(netRevenue - deductibleExpenses)}</strong>
          </div>
        </div>

        {/* Elegant Deep Pine Trend Sparkline */}
        <div className="pt-2">
          <svg className="w-full h-8 sm:h-9 stroke-emerald-700 fill-none" viewBox="0 0 200 40">
            <path
              d="M 0 34 Q 35 25, 75 30 T 125 15 T 165 24 T 200 10"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

    </div>
  );
}
