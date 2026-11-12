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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email_forward':
        return (
          <span title="Inkommit via e-postvidarebefordran">
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
          </span>
        );
      case 'mobile_scan':
        return (
          <span title="Mobilskanning">
            <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
          </span>
        );
      default:
        return (
          <span title="Webbuppladdning">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs space-y-0">
      
      {/* Table Header & Controls Bar */}
      <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReceiptIcon className="w-4 h-4 text-emerald-700" />
          <h4 className="text-sm font-bold text-zinc-900">Utgifter & Inköpskvitton</h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-mono font-medium border border-zinc-200">
            {filteredReceipts.length} av {receipts.length}
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök leverantör..."
              className="pl-8 pr-7 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50/70 hover:bg-white focus:bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition text-xs w-36 sm:w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Momssats Filter Dropdown */}
          <select
            value={vatFilter}
            onChange={(e) => setVatFilter(e.target.value)}
            className="py-1.5 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 font-medium focus:outline-none focus:bg-white focus:border-zinc-400 text-xs shadow-2xs"
          >
            <option value="ALL">Alla momssatser</option>
            <option value="25">25% standard</option>
            <option value="12">12% restaurang/hotell</option>
            <option value="6">6% persontransport</option>
            <option value="0">0% momsfri</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 font-medium focus:outline-none focus:bg-white focus:border-zinc-400 text-xs shadow-2xs"
          >
            <option value="ALL">Alla statusar</option>
            <option value="verified">Godkända</option>
            <option value="parsed">Kräver granskning</option>
          </select>

          {/* Export SIE-4 Button */}
          {onExportSIE && (
            <button
              onClick={onExportSIE}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              title="Ladda ner SIE-4 fil för Fortnox, Visma eller Bokio"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Exportera SIE-4</span>
            </button>
          )}
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          {receipts.length === 0 
            ? 'Inga utgifter registrerade ännu. Läs in ett kvitto eller vidarebefordra via e-post.' 
            : 'Inga kvitton matchar din sökning eller filter.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-600 border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Datum</th>
                <th className="py-2.5 px-4 font-semibold">Leverantör & BAS-konto</th>
                <th className="py-2.5 px-4 font-semibold">Källa</th>
                <th className="py-2.5 px-4 font-semibold">Moms</th>
                <th className="py-2.5 px-4 font-semibold text-right">Momsbelopp</th>
                <th className="py-2.5 px-4 font-semibold text-right">Totalt (SEK)</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70">
              {filteredReceipts.map((rec) => {
                const isAmbiguous = rec.status === 'parsed' && (rec.vat_rate === 12 || rec.total_amount > 2000);

                return (
                  <tr key={rec.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-600 font-mono text-[11px]">
                      {formatDate(rec.invoice_date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>{rec.vendor_name}</span>
                        {isAmbiguous && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Granska
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>{rec.category}</span>
                        <span className="font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200 text-[10px] font-semibold">
                          BAS {rec.raw_ai_response?.bas_account || '6990'}
                        </span>
                      </div>

                      {/* Ambiguous rate selector */}
                      {isAmbiguous && onUpdateReceiptVatRate && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-zinc-600 bg-zinc-50 p-1.5 rounded border border-zinc-200">
                          <span>Momssats:</span>
                          <button
                            onClick={() => onUpdateReceiptVatRate(rec.id, 12)}
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
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
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
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

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        {getSourceIcon(rec.source_type)}
                        <span className="capitalize text-[11px] text-zinc-600 font-medium">
                          {rec.source_type === 'email_forward' ? 'E-post' : rec.source_type === 'mobile_scan' ? 'Mobil' : 'Uppladdad'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {rec.vat_rate}%
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-700 font-medium tabular-nums">
                      {formatSEK(rec.vat_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-zinc-950 tabular-nums">
                      {formatSEK(rec.total_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Godkänd
                        </span>
                      ) : (
                        <button
                          onClick={() => onVerifyReceipt && onVerifyReceipt(rec.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-800 hover:text-zinc-950 font-bold transition bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded border border-zinc-200"
                          title="Klicka för att godkänna momsavdrag"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-600" />
                          Verifiera
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedReceipt(rec)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition"
                          title="Visa detaljer och BAS-analys"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteReceipt && (
                          <button
                            onClick={() => onDeleteReceipt(rec.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Radera kvitto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* Detail / Reasoning Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900">Underlagsdetaljer & Skattemotivering</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-zinc-400 hover:text-zinc-700 text-xs px-2 py-1 rounded hover:bg-zinc-100"
              >
                Stäng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 text-[11px] block">Leverantör</span>
                <div className="font-bold text-zinc-950 text-sm mt-0.5">{selectedReceipt.vendor_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono">
                <div>
                  <span className="text-zinc-500 text-[11px] block font-sans">Totalt belopp</span>
                  <div className="text-zinc-950 font-bold tabular-nums">{formatSEK(selectedReceipt.total_amount)}</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block font-sans">Avdragsgill moms ({selectedReceipt.vat_rate}%)</span>
                  <div className="text-emerald-700 font-bold tabular-nums">{formatSEK(selectedReceipt.vat_amount)}</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-[11px] block">Kategori & Kontoplan</span>
                <div className="text-zinc-900 font-semibold mt-0.5">{selectedReceipt.category}</div>
                <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
                  BAS-konto: {selectedReceipt.raw_ai_response?.bas_account || '6990'}
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-[11px] text-zinc-700 font-semibold block mb-1">
                  Skattemässig motivering:
                </span>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  {selectedReceipt.raw_ai_response?.reasoning || 'Standard momsavdrag för verksamhetens drift.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition"
              >
                Stäng
              </button>
              <button
                onClick={() => {
                  if (onVerifyReceipt) onVerifyReceipt(selectedReceipt.id);
                  setSelectedReceipt(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition shadow-xs"
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
