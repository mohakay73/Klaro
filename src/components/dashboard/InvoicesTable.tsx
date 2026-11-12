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
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
      
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-zinc-600" />
          <h4 className="text-sm font-bold text-zinc-900">Fakturerade Intäkter ({invoices.length})</h4>
        </div>
        <button
          onClick={onOpenAddInvoice}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition shadow-xs"
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
            <thead className="bg-zinc-50/80 text-zinc-600 border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Datum</th>
                <th className="py-2.5 px-4 font-semibold">Kund</th>
                <th className="py-2.5 px-4 font-semibold">Fakturanr</th>
                <th className="py-2.5 px-4 font-semibold">Moms</th>
                <th className="py-2.5 px-4 font-semibold text-right">Netto (exkl. moms)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Utgående Moms</th>
                <th className="py-2.5 px-4 font-semibold text-right">Totalt (SEK)</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-600 font-mono text-[11px]">
                    {formatDate(inv.invoice_date)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-zinc-900">
                      {inv.customer_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-500 text-[11px]">
                    {inv.invoice_number || 'FAKTURA-001'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {inv.vat_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-700 tabular-nums">
                    {formatSEK(inv.subtotal_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-700 tabular-nums">
                    {formatSEK(inv.vat_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-zinc-950 tabular-nums">
                    {formatSEK(inv.total_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
