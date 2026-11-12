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
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <ReceiptIcon className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-zinc-900">Senaste utgifter & kvitton</h3>
            </div>
            <button
              onClick={onNavigateToExpenses}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group transition"
            >
              <span>Visa alla ({receipts.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {receipts.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              Inga kvitton registrerade än.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentReceipts.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-zinc-50/60 rounded-lg px-2 -mx-2 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-mono text-[10px] shrink-0 font-bold">
                      {rec.vat_rate}%
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 truncate">
                        {rec.vendor_name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {formatDate(rec.invoice_date)} • {rec.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-zinc-950 tabular-nums">
                      {formatSEK(rec.total_amount)}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      varav moms {formatSEK(rec.vat_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Kvitto-AI tolkar automatiskt moms och BAS-konto.
            </span>
            <button
              onClick={onOpenUpload}
              className="text-xs font-semibold text-zinc-900 hover:text-emerald-700 transition"
            >
              + Tolka nytt kvitto
            </button>
          </div>
        </div>

        {/* Right (5 cols): Moms & Tax Deadline Snapshot */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-zinc-900">Momsdeklaration Status</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Skatteverket
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70">
                <span className="text-zinc-600 font-medium">Utgående moms (kundfakturor)</span>
                <span className="font-mono font-bold text-zinc-900 tabular-nums">
                  {formatSEK(moms.utgaendeMoms)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70">
                <span className="text-zinc-600 font-medium">Avdragsgill ingående moms</span>
                <span className="font-mono font-bold text-emerald-800 tabular-nums">
                  -{formatSEK(moms.ingaendeMoms)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-zinc-900 text-white shadow-xs">
                <div>
                  <span className="font-bold text-xs block">Netto moms att inbetala</span>
                  <span className="text-[10px] text-zinc-400">Ruta 49 Skatteverket</span>
                </div>
                <span className="font-mono font-black text-sm text-emerald-400 tabular-nums">
                  {formatSEK(moms.netMoms)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-600">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Inlämningsdag:</span>
                <span className="font-bold text-zinc-900">{nextMomsDeadline}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Inbetalning Bankgiro:</span>
                <span className="font-bold text-zinc-900">5050-1055</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
            <button
              onClick={onNavigateToTax}
              className="flex-1 py-2 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold text-center transition"
            >
              Öppna Skattedeklaration
            </button>
            <button
              onClick={onOpenPayMoms}
              className="py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold text-center transition shadow-xs"
            >
              Betala moms
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
