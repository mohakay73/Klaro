'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { Receipt, Invoice } from '@/types/database';
import { PSD2Transaction } from '@/lib/open-banking/types';
import { calculateTaxDeductionLoss } from '@/lib/open-banking/reconciliation-engine';
import { formatSEK, formatDate } from '@/lib/utils';
import { SafeToSpendWidget } from './SafeToSpendWidget';
import { RevenueExpenseCards } from './RevenueExpenseCards';
import { 
  Receipt as ReceiptIcon, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingCart,
  Train,
  Landmark, 
  ShieldCheck, 
  Check,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';

interface OverviewViewProps {
  taxBuffer: SwedishTaxBuffer;
  companyType: 'enskild_firma' | 'aktiebolag';
  receipts: Receipt[];
  invoices: Invoice[];
  bankTransactions?: PSD2Transaction[];
  onNavigateToExpenses: () => void;
  onNavigateToInvoices: () => void;
  onNavigateToTax: () => void;
  onNavigateToBank?: () => void;
  onOpenUpload: () => void;
  onOpenPayMoms: () => void;
}

export function OverviewView({
  taxBuffer,
  companyType,
  receipts,
  invoices,
  bankTransactions = [],
  onNavigateToExpenses,
  onNavigateToInvoices,
  onNavigateToTax,
  onNavigateToBank,
  onOpenUpload,
  onOpenPayMoms,
}: OverviewViewProps) {
  const recentReceipts = receipts.slice(0, 4);
  const { moms, nextMomsDeadline, nextFSkattDeadline } = taxBuffer;

  const missingBankTxs = bankTransactions.filter((t) => t.reconciliationStatus === 'missing_receipt');
  const missingBankCount = missingBankTxs.length;
  const taxLoss = calculateTaxDeductionLoss(missingBankTxs);

  const getVendorIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('sj') || lower.includes('tåg') || lower.includes('resa') || lower.includes('taxi')) {
      return <Train className="w-4 h-4 text-zinc-600" />;
    }
    return <ShoppingCart className="w-4 h-4 text-zinc-600" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Hero Widget: Safe to Spend & Tactile Skattekonto Card */}
      <SafeToSpendWidget taxBuffer={taxBuffer} companyType={companyType} />

      {/* 2. Top 3 Stat Cards with Financial Trend Sparklines */}
      <RevenueExpenseCards taxBuffer={taxBuffer} />

      {/* 2.5 Bank Reconciliation Alert Callout if missing receipts exist */}
      {missingBankCount > 0 && onNavigateToBank && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <Landmark className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-amber-950">
                  {missingBankCount} banktransaktioner saknar verifikat ({formatSEK(taxLoss.totalMissingAmount)})
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  Åtgärd krävs
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Du riskerar <strong>{formatSEK(taxLoss.totalEstimatedLoss)} i förlorat skatteavdrag</strong> (moms & egenavgifter) om underlag inte kopplas eller markeras som eget uttag.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToBank}
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shrink-0 self-start sm:self-center cursor-pointer"
          >
            <span>Öppna Avstämning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Operational Split Grid (Mockup Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (7 cols): Senaste kvitton & underlag */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
            <h3 className="text-base font-bold text-zinc-950">
              Senaste kvitton & underlag
            </h3>
            <button
              onClick={onNavigateToExpenses}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 group transition"
            >
              <span>Visa alla ({receipts.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {receipts.length === 0 ? (
            <div className="p-10 text-center text-zinc-400 text-sm">
              Inga kvitton registrerade än.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentReceipts.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between hover:bg-zinc-50/80 rounded-xl px-2.5 -mx-2.5 transition">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                      {getVendorIcon(rec.vendor_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-950 truncate text-sm">
                        {rec.vendor_name}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        BAS {rec.raw_ai_response?.bas_account || '6990'} • {rec.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-black text-zinc-950 tabular-nums text-sm">
                        {formatSEK(rec.total_amount)}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        moms {formatSEK(rec.vat_amount)}
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-700" />
                      Godkänd
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Automatisk BAS-kontoplan & momsavdrag.
            </span>
            <button
              onClick={onOpenUpload}
              className="font-bold text-[#0d3829] hover:underline"
            >
              + Tolka nytt kvitto
            </button>
          </div>
        </div>

        {/* Right (5 cols): Momsdeklaration (Skatteverket) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
            <h3 className="text-base font-bold text-zinc-950">
              Momsdeklaration (Skatteverket)
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
              Period: Q2
            </span>
          </div>

          {/* Big Bold Net Moms Callout (Mockup Style) */}
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-medium block">
              Moms att betala:
            </span>
            <div className="text-3xl font-black font-mono tracking-tight text-zinc-950 tabular-nums">
              {formatSEK(moms.netMoms)}
            </div>
          </div>

          {/* Skatteverkets Rutor table rows */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100 text-sm font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs">
              <span className="text-zinc-600 font-sans">Ruta 05 (Momspliktig försäljning):</span>
              <span className="text-zinc-950 font-bold tabular-nums">
                {formatSEK(moms.utgaendeBreakdown[25]?.netBase || moms.utgaendeMoms * 4)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs">
              <span className="text-zinc-600 font-sans">Ruta 48 (Ingående avdragsgill moms):</span>
              <span className="text-emerald-700 font-bold tabular-nums">
                -{formatSEK(moms.ingaendeMoms)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-zinc-600 font-sans font-semibold">Ruta 49 (Moms att inbetala):</span>
              <span className="text-zinc-950 font-black tabular-nums">
                {formatSEK(moms.netMoms)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
            <button
              onClick={onNavigateToTax}
              className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold text-center transition"
            >
              Öppna Deklaration
            </button>
            <button
              onClick={onOpenPayMoms}
              className="py-2.5 px-4 rounded-xl bg-[#0d3829] hover:bg-[#07251a] text-white text-xs font-semibold text-center transition shadow-xs"
            >
              Betala moms
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
