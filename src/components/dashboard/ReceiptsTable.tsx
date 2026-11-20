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
  X,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Eye,
  FileText,
  Camera,
  Upload
} from 'lucide-react';

interface ReceiptsTableProps {
  receipts: Receipt[];
  onDeleteReceipt?: (id: string) => void;
  onVerifyReceipt?: (id: string) => void;
  onUpdateReceiptVatRate?: (id: string, rate: SwedishVatRate) => void;
  onUpdateReceiptDate?: (id: string, newDate: string) => void;
  onExportSIE?: () => void;
  onOpenUpload?: () => void;
  onOpenCamera?: () => void;
}

export function ReceiptsTable({
  receipts,
  onDeleteReceipt,
  onVerifyReceipt,
  onUpdateReceiptVatRate,
  onUpdateReceiptDate,
  onExportSIE,
  onOpenUpload,
  onOpenCamera,
}: ReceiptsTableProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vatFilter, setVatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'created_desc' | 'date_desc' | 'date_asc' | 'amount_desc'>('created_desc');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDateValue, setEditDateValue] = useState('');

  const filteredReceipts = useMemo(() => {
    const list = receipts.filter((rec) => {
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

    return list.sort((a, b) => {
      if (sortBy === 'created_desc') {
        const timeA = new Date(a.created_at || a.invoice_date).getTime();
        const timeB = new Date(b.created_at || b.invoice_date).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'date_desc') {
        const dateA = new Date(a.invoice_date).getTime();
        const dateB = new Date(b.invoice_date).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'date_asc') {
        const dateA = new Date(a.invoice_date).getTime();
        const dateB = new Date(b.invoice_date).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'amount_desc') {
        return Number(b.total_amount) - Number(a.total_amount);
      }
      return 0;
    });
  }, [receipts, searchQuery, vatFilter, statusFilter, sortBy]);

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

          {/* Sortering Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-2 px-3 rounded-lg border border-[#e7e2d7] bg-[#f7f4ee] text-[#1c1917] font-medium focus:outline-none focus:bg-white focus:border-stone-400 text-sm shadow-2xs cursor-pointer"
          >
            <option value="created_desc">Sortera: Senast inkomna</option>
            <option value="date_desc">Sortera: Fakturadatum (nyast)</option>
            <option value="date_asc">Sortera: Fakturadatum (äldst)</option>
            <option value="amount_desc">Sortera: Belopp (högst)</option>
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

          {/* Quick Upload / File button */}
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="px-3 py-2 rounded-lg border border-[#e7e2d7] bg-white hover:bg-[#f7f4ee] text-[#1c1917] text-sm font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="Välj sparad fil eller PDF-faktura"
            >
              <Upload className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Ladda upp fil</span>
            </button>
          )}

          {/* Direct Camera Scan button */}
          {onOpenCamera && (
            <button
              onClick={onOpenCamera}
              className="px-3.5 py-2 rounded-lg bg-[#1c1917] hover:bg-[#292524] text-white text-sm font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="Öppna kameran direkt för att fota kvitto"
            >
              <Camera className="w-4 h-4 text-[#f59e0b]" />
              <span>Fota kvitto</span>
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
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 font-mono mt-0.5">
                          <span>{formatDate(rec.invoice_date)}</span>
                          <span>•</span>
                          <span className="font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                            BAS {rec.raw_ai_response?.bas_account || '6990'}
                          </span>
                          {rec.original_file_url && (
                            <button
                              onClick={() => setSelectedReceipt(rec)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-black bg-stone-100 active:bg-stone-200 px-1.5 py-0.5 rounded border border-stone-200 transition cursor-pointer"
                              title="Visa verifikatsbilaga"
                            >
                              <Paperclip className="w-3 h-3 text-[#d97706]" />
                              <span>Bilaga</span>
                            </button>
                          )}
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
                          {rec.original_file_url && (
                            <button
                              onClick={() => setSelectedReceipt(rec)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-black bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded border border-stone-200 transition cursor-pointer"
                              title="Visa verifikatsbilaga"
                            >
                              <Paperclip className="w-3 h-3 text-[#d97706]" />
                              <span>Bilaga</span>
                            </button>
                          )}
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

      {/* Detail / Reasoning & File Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#e7e2d7] rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-center text-[#d97706]">
                  <ReceiptIcon className="w-4 h-4 text-[#d97706]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1c1917]">{selectedReceipt.vendor_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isEditingDate ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={editDateValue}
                          onChange={(e) => setEditDateValue(e.target.value)}
                          className="px-2 py-0.5 text-xs font-mono border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-500"
                        />
                        <button
                          onClick={() => {
                            if (editDateValue && onUpdateReceiptDate) {
                              onUpdateReceiptDate(selectedReceipt.id, editDateValue);
                              setSelectedReceipt({ ...selectedReceipt, invoice_date: editDateValue });
                            }
                            setIsEditingDate(false);
                          }}
                          className="px-2 py-0.5 text-xs bg-[#1c1917] hover:bg-black text-white rounded font-medium cursor-pointer"
                        >
                          Spara
                        </button>
                        <button
                          onClick={() => setIsEditingDate(false)}
                          className="px-1.5 py-0.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                        >
                          Avbryt
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-stone-500 font-mono">{formatDate(selectedReceipt.invoice_date)}</p>
                        <button
                          onClick={() => {
                            setEditDateValue(selectedReceipt.invoice_date.split('T')[0]);
                            setIsEditingDate(true);
                          }}
                          className="text-[11px] text-[#d97706] hover:underline font-semibold cursor-pointer"
                          title="Klicka för att korrigera datum"
                        >
                          Ändra datum
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-stone-400 hover:text-stone-700 text-xs font-semibold px-2.5 py-1.5 rounded hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f7f4ee] rounded-xl border border-[#e7e2d7] font-mono">
                <div>
                  <span className="text-stone-500 text-xs block font-sans">Totalt belopp</span>
                  <div className="text-[#1c1917] font-bold tabular-nums text-lg">{formatSEK(selectedReceipt.total_amount)}</div>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block font-sans">Avdragsgill moms ({selectedReceipt.vat_rate}%)</span>
                  <div className="text-emerald-700 font-bold tabular-nums text-lg">{formatSEK(selectedReceipt.vat_amount)}</div>
                </div>
              </div>

              <div>
                <span className="text-stone-500 text-xs block">Kategori & Kontoplan</span>
                <div className="text-stone-900 font-semibold mt-0.5 text-sm">{selectedReceipt.category}</div>
                <div className="text-xs text-stone-600 font-mono mt-0.5 font-semibold">
                  BAS-konto: {selectedReceipt.raw_ai_response?.bas_account || '6990'}
                </div>
              </div>

              {/* 7-Year Archival & Original File Section (Bokföringslagen 7 kap. 2 §) */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-[#e7e2d7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Verifikatsunderlag (Originalbilaga)</span>
                  </span>
                  {selectedReceipt.original_file_url && (
                    <a
                      href={`/api/receipts/file?id=${selectedReceipt.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-stone-800 hover:text-black flex items-center gap-1 underline"
                    >
                      <span>Öppna i ny flik</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Live Image / PDF / File Preview */}
                {selectedReceipt.original_file_url ? (
                  <div className="rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col items-center justify-center p-2 relative">
                    {selectedReceipt.original_file_url.toLowerCase().includes('.pdf') ? (
                      <div className="w-full py-6 flex flex-col items-center justify-center gap-2 bg-stone-50 rounded border border-stone-200">
                        <FileText className="w-8 h-8 text-rose-600" />
                        <span className="text-xs font-semibold text-stone-800">
                          PDF-kvitto bifogat
                        </span>
                        <a
                          href={`/api/receipts/file?id=${selectedReceipt.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 px-3 py-1.5 rounded-lg bg-[#1c1917] hover:bg-black text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Öppna PDF i fullskärm</span>
                        </a>
                      </div>
                    ) : (
                      <img
                        src={`/api/receipts/file?id=${selectedReceipt.id}`}
                        alt={selectedReceipt.vendor_name}
                        className="max-h-60 max-w-full object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="text-xs text-stone-500 py-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate max-w-[280px]">
                        {selectedReceipt.original_file_url}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-stone-100 border border-stone-200 text-center text-xs text-stone-500">
                    Inget bild- eller PDF-underlag sparat för denna post (skapad via e-posttext eller fritext).
                  </div>
                )}

                <div className="flex items-start sm:items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    <strong>Bokföringslagen 7 kap. 2 §:</strong> Originalunderlag sparat i arkiv (ska bevaras t.o.m. <strong>31 dec {new Date(selectedReceipt.invoice_date).getFullYear() + 7}</strong>).
                  </span>
                </div>
              </div>

              {/* Tax Reasoning */}
              <div className="p-3.5 bg-[#f7f4ee]/70 rounded-xl border border-[#e7e2d7]">
                <span className="text-xs text-stone-700 font-bold block mb-1">
                  Skattemässig motivering:
                </span>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {selectedReceipt.raw_ai_response?.reasoning || 'Standard momsavdrag för verksamhetens drift.'}
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#e7e2d7]">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-lg border border-[#e7e2d7] hover:bg-stone-50 text-stone-700 text-sm font-semibold transition cursor-pointer"
              >
                Stäng
              </button>
              {selectedReceipt.status !== 'verified' && onVerifyReceipt && (
                <button
                  onClick={() => {
                    onVerifyReceipt(selectedReceipt.id);
                    setSelectedReceipt(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1c1917] hover:bg-black text-white text-sm font-semibold transition shadow-xs cursor-pointer"
                >
                  Godkänn underlag
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
