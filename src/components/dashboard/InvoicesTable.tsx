'use client';

import React from 'react';
import { Invoice } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { FileCheck, Plus, CheckCircle2, Building } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  onOpenAddInvoice: () => void;
}

export function InvoicesTable({ invoices, onOpenAddInvoice }: InvoicesTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Fakturerade Intäkter ({invoices.length})</h4>
        </div>
        <button
          onClick={onOpenAddInvoice}
          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ny faktura</span>
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-sm">
          Inga fakturor registrerade. Skapa en faktura för att simulera din intäkt och momsreserv.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Datum</th>
                <th className="py-3 px-4 font-medium">Kund</th>
                <th className="py-3 px-4 font-medium">Fakturanr</th>
                <th className="py-3 px-4 font-medium">Momssats</th>
                <th className="py-3 px-4 font-medium text-right">Netto (exkl. moms)</th>
                <th className="py-3 px-4 font-medium text-right">Utgående Moms</th>
                <th className="py-3 px-4 font-medium text-right">Totalt (SEK)</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono">
                    {formatDate(inv.invoice_date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      {inv.customer_name}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-400">
                    {inv.invoice_number || 'FAKTURA-001'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono border bg-zinc-800/80 text-zinc-300 border-zinc-700">
                      {inv.vat_rate}% moms
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-300">
                    {formatSEK(inv.subtotal_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-amber-400 font-medium">
                    {formatSEK(inv.vat_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold text-white">
                    {formatSEK(inv.total_amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
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
