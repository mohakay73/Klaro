'use client';

import React, { useState, useMemo } from 'react';
import { Receipt, SwedishVatRate } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { 
  Receipt as ReceiptIcon, 
  Mail, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Info, 
  Download,
  Check,
  Search,
  Filter,
  X
} from 'lucide-react';

interface ReceiptsTableProps {
  receipts: Receipt[];
  onDeleteReceipt?: (id: string) => void;
  onVerifyReceipt?: (id: string) => void;
  onUpdateReceiptVatRate?: (id: string, rate: SwedishVatRate) => void;
  onExportSIE?: () => void;
}

export function ReceiptsTable({
  receipts,
  onDeleteReceipt,
  onVerifyReceipt,
  onUpdateReceiptVatRate,
  onExportSIE,
}: ReceiptsTableProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vatFilter, setVatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredReceipts = useMemo(() => {
    return receipts.filter((rec) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        rec.vendor_name.toLowerCase().includes(query) ||
        rec.category.toLowerCase().includes(query) ||
        rec.total_amount.toString().includes(query);

      // VAT filter
      const matchesVat = 
        vatFilter === 'ALL' || 
        rec.vat_rate.toString() === vatFilter;

      // Status filter
      const matchesStatus = 
        statusFilter === 'ALL' || 
        rec.status === statusFilter;

      return matchesSearch && matchesVat && matchesStatus;
    });
  }, [receipts, searchQuery, vatFilter, statusFilter]);

  const hasActiveFilters = searchQuery.length > 0 || vatFilter !== 'ALL' || statusFilter !== 'ALL';

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email_forward':
        return (
          <span title="Inkommit via e-postvidarebefordran">
            <Mail className="w-4 h-4 text-zinc-500" />
          </span>
        );
      case 'mobile_scan':
        return (
          <span title="Mobilskanning">
            <Smartphone className="w-4 h-4 text-zinc-500" />
          </span>
        );
      default:
        return (
          <span title="Webbuppladdning">
            <Globe className="w-4 h-4 text-zinc-500" />
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-[#e7e2d7] bg-white overflow-hidden shadow-xs space-y-0">
      
      {/* Table Header & Controls Bar */}
      <div className="p-5 border-b border-[#e7e2d7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ReceiptIcon className="w-5 h-5 text-[#d97706]" />
          <h3 className="text-base font-bold text-[#1c1917]">Utgifter & Inköpskvitton</h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#f7f4ee] text-stone-700 font-mono font-semibold border border-[#e7e2d7]">
            {filteredReceipts.length} av {receipts.length}
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök leverantör, kategori..."
              className="pl-9 pr-7 py-2 rounded-lg border border-[#e7e2d7] bg-[#f7f4ee]/70 hover:bg-white focus:bg-white text-[#1c1917] placeholder-stone-400 focus:outline-none focus:border-stone-400 transition text-sm w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Momssats Filter Dropdown */}
          <select
            value={vatFilter}
            onChange={(e) => setVatFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-[#e7e2d7] bg-[#f7f4ee] text-[#1c1917] font-medium focus:outline-none focus:bg-white focus:border-stone-400 text-sm shadow-2xs cursor-pointer"
          >
            <option value="ALL">Alla momssatser</option>
            <option value="25">25% (Standard)</option>
            <option value="12">12% (Restaurang/Hotell)</option>
            <option value="6">6% (Persontransport/Böcker)</option>
            <option value="0">0% (Momsfri)</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-[#e7e2d7] bg-[#f7f4ee] text-[#1c1917] font-medium focus:outline-none focus:bg-white focus:border-stone-400 text-sm shadow-2xs cursor-pointer"
          >
            <option value="ALL">Alla statusar</option>
            <option value="verified">Godkända verifikationer</option>
            <option value="parsed">Kräver granskning</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVatFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-stone-600 hover:text-[#1c1917] hover:bg-[#f7f4ee] transition text-sm font-medium"
              title="Rensa filter"
            >
              <X className="w-4 h-4" />
              <span>Rensa</span>
            </button>
          )}

          {/* Export SIE-4 Button */}
          {onExportSIE && (
            <button
              onClick={onExportSIE}
              className="px-3.5 py-2 rounded-lg border border-[#e7e2d7] bg-white hover:bg-[#f7f4ee] text-[#1c1917] text-sm font-semibold flex items-center gap-2 transition shadow-2xs cursor-pointer"
              title="Ladda ner SIE-4 fil för Fortnox, Visma eller Bokio"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Exportera SIE-4</span>
            </button>
          )}
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <div className="p-14 text-center text-zinc-500 text-sm">
          {receipts.length === 0 
            ? 'Inga utgifter registrerade ännu. Läs in ett kvitto eller vidarebefordra via e-post.' 
            : 'Inga kvitton matchar din sökning eller filter.'}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVatFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="block mx-auto mt-2 text-emerald-700 hover:underline font-semibold"
            >
              Återställ filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card List View (< 768px) */}
          <div className="md:hidden divide-y divide-zinc-200/80">
            {filteredReceipts.map((rec) => {
              const isAmbiguous = rec.status === 'parsed' && (rec.vat_rate === 12 || rec.total_amount > 2000);

              return (
                <div 
                  key={rec.id} 
                  className="p-4 space-y-3 bg-white hover:bg-zinc-50/70 transition active:bg-zinc-100/50"
                >
                  {/* Top: Vendor + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-600">
                        {getSourceIcon(rec.source_type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-950 truncate">{rec.vendor_name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mt-0.5">
                          <span>{formatDate(rec.invoice_date)}</span>
                          <span>•</span>
                          <span className="font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                            BAS {rec.raw_ai_response?.bas_account || '6990'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {rec.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Godkänd
                        </span>
                      ) : (
                        <button
                          onClick={() => onVerifyReceipt && onVerifyReceipt(rec.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-800 font-bold bg-zinc-100 active:bg-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-300"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-600" />
                          Verifiera
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financials Strip */}
                  <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">Totalt belopp</span>
                      <span className="font-mono font-black text-base text-zinc-950 tabular-nums">
                        {formatSEK(rec.total_amount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">Moms ({rec.vat_rate}%)</span>
                      <span className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                        {formatSEK(rec.vat_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Ambiguous Rate Selector */}
                  {isAmbiguous && onUpdateReceiptVatRate && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                      <span className="text-amber-900 font-medium text-[11px] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        Välj moms:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateReceiptVatRate(rec.id, 12)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            rec.vat_rate === 12 
                              ? 'bg-amber-900 text-white' 
                              : 'bg-white text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          12% mat
                        </button>
                        <button
                          onClick={() => onUpdateReceiptVatRate(rec.id, 25)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            rec.vat_rate === 25 
                              ? 'bg-amber-900 text-white' 
                              : 'bg-white text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          25% standard
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Actions Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-xs">
                    <span className="text-zinc-500 truncate max-w-[180px]">{rec.category}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReceipt(rec)}
                        className="px-2.5 py-1.5 text-zinc-700 hover:text-zinc-950 bg-zinc-100 active:bg-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Detaljer</span>
                      </button>
                      {onDeleteReceipt && (
                        <button
                          onClick={() => onDeleteReceipt(rec.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 active:bg-rose-50 rounded-lg transition"
                          title="Ta bort kvitto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f4ee]/80 text-stone-600 border-b border-[#e7e2d7] text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 font-semibold">Datum</th>
                  <th className="py-3 px-4 font-semibold">Leverantör & BAS-konto</th>
                  <th className="py-3 px-4 font-semibold">Källa</th>
                  <th className="py-3 px-4 font-semibold">Moms</th>
                  <th className="py-3 px-4 font-semibold text-right">Momsbelopp</th>
                  <th className="py-3 px-4 font-semibold text-right">Totalt (SEK)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e2d7]/70">
                {filteredReceipts.map((rec) => {
                  const isAmbiguous = rec.status === 'parsed' && (rec.vat_rate === 12 || rec.total_amount > 2000);

                  return (
                    <tr key={rec.id} className="hover:bg-[#f7f4ee]/50 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 font-mono text-xs">
                        {formatDate(rec.invoice_date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1c1917] flex items-center gap-2 text-sm">
                          <span>{rec.vendor_name}</span>
                          {isAmbiguous && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Granska
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-500 flex items-center gap-2 mt-1">
                          <span>{rec.category}</span>
                          <span className="font-mono text-stone-700 bg-[#f7f4ee] px-2 py-0.5 rounded border border-[#e7e2d7] font-semibold">
                            BAS {rec.raw_ai_response?.bas_account || '6990'}
                          </span>
                        </div>

                        {/* Ambiguous rate selector */}
                        {isAmbiguous && onUpdateReceiptVatRate && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                            <span className="font-medium">Momssats:</span>
                            <button
                              onClick={() => onUpdateReceiptVatRate(rec.id, 12)}
                              className={`px-2 py-1 rounded font-mono text-xs ${
                                rec.vat_rate === 12 
                                  ? 'bg-zinc-900 text-white font-bold' 
                                  : 'hover:bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              12% representation
                            </button>
                            <span>/</span>
                            <button
                              onClick={() => onUpdateReceiptVatRate(rec.id, 25)}
                              className={`px-2 py-1 rounded font-mono text-xs ${
                                rec.vat_rate === 25 
                                  ? 'bg-zinc-900 text-white font-bold' 
                                  : 'hover:bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              25% standard
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-zinc-600 text-xs">
                          {getSourceIcon(rec.source_type)}
                          <span className="capitalize font-medium">
                            {rec.source_type === 'email_forward' ? 'E-post' : rec.source_type === 'mobile_scan' ? 'Mobil' : 'Webb'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {rec.vat_rate}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-zinc-700 font-semibold tabular-nums text-sm">
                        {formatSEK(rec.vat_amount)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-black text-zinc-950 tabular-nums text-sm">
                        {formatSEK(rec.total_amount)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            Godkänd
                          </span>
                        ) : (
                          <button
                            onClick={() => onVerifyReceipt && onVerifyReceipt(rec.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-zinc-800 hover:text-zinc-950 font-bold transition bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-300"
                            title="Klicka för att godkänna momsavdrag"
                          >
                            <Check className="w-4 h-4 text-zinc-600" />
                            Verifiera
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReceipt(rec)}
                            className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition"
                            title="Visa detaljer och BAS-analys"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {onDeleteReceipt && (
                            <button
                              onClick={() => onDeleteReceipt(rec.id)}
                              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Radera kvitto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail / Reasoning Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-950">Underlagsdetaljer & Skattemotivering</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-zinc-400 hover:text-zinc-700 text-xs font-semibold px-2.5 py-1.5 rounded hover:bg-zinc-100 transition"
              >
                Stäng
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-zinc-500 text-xs block">Leverantör</span>
                <div className="font-bold text-zinc-950 text-base mt-0.5">{selectedReceipt.vendor_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 font-mono">
                <div>
                  <span className="text-zinc-500 text-xs block font-sans">Totalt belopp</span>
                  <div className="text-zinc-950 font-bold tabular-nums text-base">{formatSEK(selectedReceipt.total_amount)}</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block font-sans">Avdragsgill moms ({selectedReceipt.vat_rate}%)</span>
                  <div className="text-emerald-700 font-bold tabular-nums text-base">{formatSEK(selectedReceipt.vat_amount)}</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-xs block">Kategori & Kontoplan</span>
                <div className="text-zinc-900 font-semibold mt-0.5 text-sm">{selectedReceipt.category}</div>
                <div className="text-xs text-zinc-600 font-mono mt-0.5 font-semibold">
                  BAS-konto: {selectedReceipt.raw_ai_response?.bas_account || '6990'}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-xs text-zinc-700 font-bold block mb-1">
                  Skattemässig motivering:
                </span>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  {selectedReceipt.raw_ai_response?.reasoning || 'Standard momsavdrag för verksamhetens drift.'}
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-zinc-100">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold transition"
              >
                Stäng
              </button>
              <button
                onClick={() => {
                  if (onVerifyReceipt) onVerifyReceipt(selectedReceipt.id);
                  setSelectedReceipt(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition shadow-xs"
              >
                Godkänn underlag
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
