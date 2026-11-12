'use client';

import React from 'react';
import { Invoice } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { FileCheck, Plus, CheckCircle2 } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  onOpenAddInvoice: () => void;
}

export function InvoicesTable({ invoices, onOpenAddInvoice }: InvoicesTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-zinc-100">Fakturerade Intäkter ({invoices.length})</h4>
        </div>
        <button
          onClick={onOpenAddInvoice}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Skapa faktura</span>
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          Inga fakturor registrerade. Skapa en faktura för att simulera intäkt och momsreserv.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-medium">Datum</th>
                <th className="py-2.5 px-4 font-medium">Kund</th>
                <th className="py-2.5 px-4 font-medium">Fakturanr</th>
                <th className="py-2.5 px-4 font-medium">Moms</th>
                <th className="py-2.5 px-4 font-medium text-right">Netto (exkl. moms)</th>
                <th className="py-2.5 px-4 font-medium text-right">Utgående Moms</th>
                <th className="py-2.5 px-4 font-medium text-right">Totalt (SEK)</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                    {formatDate(inv.invoice_date)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-zinc-200">
                      {inv.customer_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-400 text-[11px]">
                    {inv.invoice_number || 'FAKTURA-001'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {inv.vat_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-300 tabular-nums">
                    {formatSEK(inv.subtotal_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-300 tabular-nums">
                    {formatSEK(inv.vat_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-medium text-zinc-100 tabular-nums">
                    {formatSEK(inv.total_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Betald
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
