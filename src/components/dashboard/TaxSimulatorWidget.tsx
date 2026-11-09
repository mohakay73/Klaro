'use client';

import React, { useState, useMemo } from 'react';
import { calculateSwedishTaxBuffer } from '@/lib/tax-calculator';
import { Invoice, Receipt } from '@/types/database';
import { formatSEK } from '@/lib/utils';
import { 
  Calculator, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  ShoppingBag,
  Briefcase
} from 'lucide-react';

interface TaxSimulatorWidgetProps {
  currentInvoices: Invoice[];
  currentReceipts: Receipt[];
  companyType: 'enskild_firma' | 'aktiebolag';
  municipalTaxRate: number;
}

export function TaxSimulatorWidget({
  currentInvoices,
  currentReceipts,
  companyType,
  municipalTaxRate,
}: TaxSimulatorWidgetProps) {
  const [additionalRevenue, setAdditionalRevenue] = useState(0);
  const [additionalExpense, setAdditionalExpense] = useState(0);
  const [expenseVatRate, setExpenseVatRate] = useState<25 | 12 | 6 | 0>(25);

  // Baseline calculation
  const baseline = useMemo(() => {
    return calculateSwedishTaxBuffer(currentInvoices, currentReceipts, {
      companyType,
      estimatedMunicipalTaxRate: municipalTaxRate,
    });
  }, [currentInvoices, currentReceipts, companyType, municipalTaxRate]);

  // Simulated calculation
  const simulated = useMemo(() => {
    const simInvoices = [...currentInvoices];
    const simReceipts = [...currentReceipts];

    if (additionalRevenue > 0) {
      const vat = Math.round((additionalRevenue - additionalRevenue / 1.25) * 100) / 100;
      simInvoices.push({
        id: 'sim-inv',
        user_id: 'user',
        customer_name: 'Simulerad intäkt',
        invoice_date: '2026-06-01',
        currency: 'SEK',
        subtotal_amount: additionalRevenue - vat,
        vat_amount: vat,
        total_amount: additionalRevenue,
        vat_rate: 25,
        status: 'paid',
        created_at: new Date().toISOString(),
      });
    }

    if (additionalExpense > 0) {
      const rate = expenseVatRate;
      const vat = rate > 0 ? Math.round((additionalExpense - additionalExpense / (1 + rate / 100)) * 100) / 100 : 0;
      simReceipts.push({
        id: 'sim-rec',
        user_id: 'user',
        original_file_url: null,
        source_type: 'web_upload',
        vendor_name: 'Simulerat inköp',
        invoice_date: '2026-06-01',
        currency: 'SEK',
        total_amount: additionalExpense,
        vat_amount: vat,
        vat_rate: rate,
        category: 'Simulerat inköp',
        raw_ai_response: null,
        status: 'verified',
        created_at: new Date().toISOString(),
      });
    }

    return calculateSwedishTaxBuffer(simInvoices, simReceipts, {
      companyType,
      estimatedMunicipalTaxRate: municipalTaxRate,
    });
  }, [currentInvoices, currentReceipts, additionalRevenue, additionalExpense, expenseVatRate, companyType, municipalTaxRate]);

  const safeDiff = simulated.safeToSpend - baseline.safeToSpend;
  const bufferDiff = simulated.totalTaxBuffer - baseline.totalTaxBuffer;

  const handleReset = () => {
    setAdditionalRevenue(0);
    setAdditionalExpense(0);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Skatte- & Vinstsimulator ("Vad händer om?")</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                Interaktiv Prognos
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Se exakt hur ett nytt kunduppdrag eller datorinköp förändrar ditt säkra disponibla belopp i realtid.
            </p>
          </div>
        </div>

        {(additionalRevenue > 0 || additionalExpense > 0) && (
          <button
            onClick={handleReset}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Återställ</span>
          </button>
        )}
      </div>

      {/* Sliders and Quick Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* Additional Revenue Slider */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Simulera ny fakturering (inkl. 25% moms)</span>
            </label>
            <span className="font-mono font-bold text-sm text-emerald-400">
              +{formatSEK(additionalRevenue)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="150000"
            step="5000"
            value={additionalRevenue}
            onChange={(e) => setAdditionalRevenue(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex gap-2 pt-1">
            {[25000, 50000, 80000, 100000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAdditionalRevenue(val)}
                className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                  additionalRevenue === val
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                +{(val / 1000)}k kr
              </button>
            ))}
          </div>
        </div>

        {/* Additional Expense Slider */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>Simulera nytt inköp (t.ex. MacBook, kurs)</span>
            </label>
            <span className="font-mono font-bold text-sm text-rose-400">
              -{formatSEK(additionalExpense)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="60000"
            step="2000"
            value={additionalExpense}
            onChange={(e) => setAdditionalExpense(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              {[8000, 15000, 32000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAdditionalExpense(val)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                    additionalExpense === val
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {(val / 1000)}k kr
                </button>
              ))}
            </div>

            <select
              value={expenseVatRate}
              onChange={(e) => setExpenseVatRate(Number(e.target.value) as any)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[11px] font-mono focus:outline-none"
            >
              <option value={25}>25% moms</option>
              <option value={12}>12% moms</option>
              <option value={6}>6% moms</option>
              <option value={0}>0% moms</option>
            </select>
          </div>
        </div>

      </div>

      {/* Real-time comparison display */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        
        {/* Safe to spend impact */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider block font-sans">
            Säkert att ta ut (Disponibelt)
          </span>
          <div className="text-xl font-bold text-white">
            {formatSEK(simulated.safeToSpend)}
          </div>
          <div className="text-[11px] flex items-center gap-1 font-sans">
            <span className="text-zinc-500">Förändring:</span>
            <span className={`font-mono font-bold ${
              safeDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {safeDiff >= 0 ? `+${formatSEK(safeDiff)}` : formatSEK(safeDiff)}
            </span>
          </div>
        </div>

        {/* Skattebuffert impact */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider block font-sans">
            Skattebuffert (Skatteverket)
          </span>
          <div className="text-xl font-bold text-amber-300">
            {formatSEK(simulated.totalTaxBuffer)}
          </div>
          <div className="text-[11px] flex items-center gap-1 font-sans">
            <span className="text-zinc-500">Moms + F-skatt:</span>
            <span className="font-mono text-zinc-300">
              {bufferDiff >= 0 ? `+${formatSEK(bufferDiff)}` : formatSEK(bufferDiff)}
            </span>
          </div>
        </div>

        {/* Resultat efter skatt insikt */}
        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
          <span className="text-emerald-400 text-[11px] uppercase tracking-wider block font-sans font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Klaro Ekonomisk Insikt
          </span>
          <p className="text-zinc-300 text-[11px] font-sans leading-relaxed pt-0.5">
            {additionalExpense > 0 && additionalRevenue === 0 ? (
              `Inköpet minskar din vinstskatt och moms med ca ${formatSEK(additionalExpense * 0.55)}. Effektiv kostnad för dig blir endast ${formatSEK(additionalExpense * 0.45)}!`
            ) : additionalRevenue > 0 ? (
              `Av ${formatSEK(additionalRevenue)} kan du säkert ta ut ${formatSEK(safeDiff)} till privatkontot. Resterande ${formatSEK(bufferDiff)} skyddas automatiskt i skattebufferten.`
            ) : (
              'Dra i reglagen ovan för att se hur inköp eller extra fakturering slår på din disponibla kassa.'
            )}
          </p>
        </div>

      </div>

    </div>
  );
}
