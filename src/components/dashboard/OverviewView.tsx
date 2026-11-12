'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { Receipt, Invoice } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { SafeToSpendWidget } from './SafeToSpendWidget';
import { RevenueExpenseCards } from './RevenueExpenseCards';
import { 
  Receipt as ReceiptIcon, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Landmark, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface OverviewViewProps {
  taxBuffer: SwedishTaxBuffer;
  companyType: 'enskild_firma' | 'aktiebolag';
  receipts: Receipt[];
  invoices: Invoice[];
  onNavigateToExpenses: () => void;
  onNavigateToInvoices: () => void;
  onNavigateToTax: () => void;
  onOpenUpload: () => void;
  onOpenPayMoms: () => void;
}

export function OverviewView({
  taxBuffer,
  companyType,
  receipts,
  invoices,
  onNavigateToExpenses,
  onNavigateToInvoices,
  onNavigateToTax,
  onOpenUpload,
  onOpenPayMoms,
}: OverviewViewProps) {
  const recentReceipts = receipts.slice(0, 5);
  const { moms, nextMomsDeadline, nextFSkattDeadline } = taxBuffer;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Hero Widget: Safe to Spend */}
      <SafeToSpendWidget taxBuffer={taxBuffer} companyType={companyType} />

      {/* 2. Top 3 Stat Cards */}
      <RevenueExpenseCards taxBuffer={taxBuffer} />

      {/* 3. Operational Quick Glance Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 cols): Recent Receipts */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <ReceiptIcon className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-zinc-950">Senaste utgifter & kvitton</h3>
            </div>
            <button
              onClick={onNavigateToExpenses}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 group transition"
            >
              <span>Visa alla ({receipts.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-mono text-xs shrink-0 font-bold">
                      {rec.vat_rate}%
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-950 truncate text-sm">
                        {rec.vendor_name}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        {formatDate(rec.invoice_date)} • {rec.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-zinc-950 tabular-nums text-sm">
                      {formatSEK(rec.total_amount)}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">
                      varav moms {formatSEK(rec.vat_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Kvitto-AI tolkar automatiskt moms och BAS-konto.
            </span>
            <button
              onClick={onOpenUpload}
              className="text-sm font-semibold text-zinc-900 hover:text-emerald-700 transition"
            >
              + Tolka nytt kvitto
            </button>
          </div>
        </div>

        {/* Right (5 cols): Moms & Tax Deadline Snapshot */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-zinc-950">Momsdeklaration Status</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Skatteverket
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-zinc-700 font-medium text-sm">Utgående moms (kundfakturor)</span>
                <span className="font-mono font-bold text-zinc-950 tabular-nums text-sm">
                  {formatSEK(moms.utgaendeMoms)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-zinc-700 font-medium text-sm">Avdragsgill ingående moms</span>
                <span className="font-mono font-bold text-emerald-800 tabular-nums text-sm">
                  -{formatSEK(moms.ingaendeMoms)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-950 text-white shadow-xs border border-emerald-800/40">
                <div>
                  <span className="font-bold text-sm block text-emerald-50">Netto moms att inbetala</span>
                  <span className="text-xs text-emerald-300/80">Ruta 49 Skatteverket</span>
                </div>
                <span className="font-mono font-black text-lg text-emerald-300 tabular-nums">
                  {formatSEK(moms.netMoms)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-sm text-zinc-600">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Inlämningsdag:</span>
                <span className="font-bold text-zinc-900">{nextMomsDeadline}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Inbetalning Bankgiro:</span>
                <span className="font-bold text-zinc-900">5050-1055</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
            <button
              onClick={onNavigateToTax}
              className="flex-1 py-2.5 px-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-sm font-semibold text-center transition"
            >
              Öppna Deklaration
            </button>
            <button
              onClick={onOpenPayMoms}
              className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold text-center transition shadow-xs"
            >
              Betala moms
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
