'use client';

import React, { useState, useMemo } from 'react';
import { Invoice } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { FileCheck, Plus, CheckCircle2, Search, Filter, X } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  onOpenAddInvoice: () => void;
}

export function InvoicesTable({ invoices, onOpenAddInvoice }: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vatFilter, setVatFilter] = useState<string>('ALL');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        inv.customer_name.toLowerCase().includes(query) ||
        (inv.invoice_number && inv.invoice_number.toLowerCase().includes(query)) ||
        inv.total_amount.toString().includes(query);

      const matchesVat =
        vatFilter === 'ALL' || inv.vat_rate.toString() === vatFilter;

      return matchesSearch && matchesVat;
    });
  }, [invoices, searchQuery, vatFilter]);

  const hasActiveFilters = searchQuery.length > 0 || vatFilter !== 'ALL';

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs space-y-0">
      
      {/* Table Header & Controls Bar */}
      <div className="p-5 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-zinc-950">Fakturerade Intäkter</h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-mono font-semibold border border-zinc-200">
            {filteredInvoices.length} av {invoices.length}
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök kund, fakturanr..."
              className="pl-9 pr-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50/70 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-hidden focus:ring-1 focus:ring-zinc-900 focus:bg-white transition w-44 sm:w-56"
            />
          </div>

          {/* Moms Filter Dropdown */}
          <div className="relative flex items-center">
            <select
              value={vatFilter}
              onChange={(e) => setVatFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-zinc-200 bg-zinc-50/70 text-zinc-800 text-sm focus:outline-hidden focus:ring-1 focus:ring-zinc-900 focus:bg-white transition cursor-pointer font-medium"
            >
              <option value="ALL">Alla momssatser</option>
              <option value="25">25% (Standard)</option>
              <option value="12">12% (Mat & Hotell)</option>
              <option value="6">6% (Böcker & Resor)</option>
              <option value="0">0% (Momsfri)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVatFilter('ALL');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition text-sm font-medium"
              title="Rensa filter"
            >
              <X className="w-4 h-4" />
              <span>Rensa</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={onOpenAddInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition shadow-xs ml-auto md:ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Skapa faktura</span>
          </button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="p-14 text-center text-zinc-500 text-sm">
          Inga fakturor registrerade. Skapa en faktura för att simulera intäkt och momsreserv.
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-sm">
          Inga fakturor matchar sökningen &quot;{searchQuery}&quot;.
          <button
            onClick={() => {
              setSearchQuery('');
              setVatFilter('ALL');
            }}
            className="block mx-auto mt-2 text-emerald-700 hover:underline font-semibold"
          >
            Återställ filter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/80 text-zinc-600 border-b border-zinc-200 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 font-semibold">Datum</th>
                <th className="py-3 px-4 font-semibold">Kund</th>
                <th className="py-3 px-4 font-semibold">Fakturanr</th>
                <th className="py-3 px-4 font-semibold">Moms</th>
                <th className="py-3 px-4 font-semibold text-right">Netto (exkl. moms)</th>
                <th className="py-3 px-4 font-semibold text-right">Utgående Moms</th>
                <th className="py-3 px-4 font-semibold text-right">Totalt (SEK)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600 font-mono text-xs">
                    {formatDate(inv.invoice_date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-zinc-950 text-sm">
                      {inv.customer_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-500 text-xs">
                    {inv.invoice_number || 'FAKTURA-001'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {inv.vat_rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-zinc-700 tabular-nums font-semibold text-sm">
                    {formatSEK(inv.subtotal_amount)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-zinc-700 tabular-nums font-semibold text-sm">
                    {formatSEK(inv.vat_amount)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-black text-zinc-950 tabular-nums text-sm">
                    {formatSEK(inv.total_amount)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
