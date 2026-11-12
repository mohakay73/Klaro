'use client';

import React, { useState } from 'react';
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
  Check
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email_forward':
        return (
          <span title="Inkommit via e-postvidarebefordran">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
          </span>
        );
      case 'mobile_scan':
        return (
          <span title="Mobilskanning">
            <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
          </span>
        );
      default:
        return (
          <span title="Webbuppladdning">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReceiptIcon className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-zinc-100">Utgifter & Kvitton ({receipts.length})</h4>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700/60">
            BAS 2026
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onExportSIE && (
            <button
              onClick={onExportSIE}
              className="px-3 py-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
              title="Ladda ner SIE-4 fil för Fortnox, Visma eller Bokio"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Exportera SIE-4 fil</span>
            </button>
          )}
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          Inga utgifter registrerade ännu. Läs in ett kvitto eller vidarebefordra via e-post.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-medium">Datum</th>
                <th className="py-2.5 px-4 font-medium">Leverantör & BAS-konto</th>
                <th className="py-2.5 px-4 font-medium">Källa</th>
                <th className="py-2.5 px-4 font-medium">Moms</th>
                <th className="py-2.5 px-4 font-medium text-right">Momsbelopp</th>
                <th className="py-2.5 px-4 font-medium text-right">Totalt (SEK)</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {receipts.map((rec) => {
                const isAmbiguous = rec.status === 'parsed' && (rec.vat_rate === 12 || rec.total_amount > 2000);

                return (
                  <tr key={rec.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                      {formatDate(rec.invoice_date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                        <span>{rec.vendor_name}</span>
                        {isAmbiguous && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            Granska
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>{rec.category}</span>
                        <span className="font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800 text-[10px]">
                          BAS {rec.raw_ai_response?.bas_account || '6990'}
                        </span>
                      </div>

                      {/* Ambiguous rate selector */}
                      {isAmbiguous && onUpdateReceiptVatRate && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-950 p-1.5 rounded border border-zinc-800">
                          <span>Momssats:</span>
                          <button
                            onClick={() => onUpdateReceiptVatRate(rec.id, 12)}
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                              rec.vat_rate === 12 
                                ? 'bg-zinc-200 text-zinc-950 font-semibold' 
                                : 'hover:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            12% representation
                          </button>
                          <span>/</span>
                          <button
                            onClick={() => onUpdateReceiptVatRate(rec.id, 25)}
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                              rec.vat_rate === 25 
                                ? 'bg-zinc-200 text-zinc-950 font-semibold' 
                                : 'hover:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            25% standard
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        {getSourceIcon(rec.source_type)}
                        <span className="capitalize text-[11px] text-zinc-500">
                          {rec.source_type === 'email_forward' ? 'E-post' : rec.source_type === 'mobile_scan' ? 'Mobil' : 'Uppladdad'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        {rec.vat_rate}%
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-zinc-300 tabular-nums">
                      {formatSEK(rec.vat_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-medium text-zinc-100 tabular-nums">
                      {formatSEK(rec.total_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Godkänd
                        </span>
                      ) : (
                        <button
                          onClick={() => onVerifyReceipt && onVerifyReceipt(rec.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white font-medium transition"
                          title="Klicka för att godkänna momsavdrag"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                          Verifiera
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedReceipt(rec)}
                          className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
                          title="Visa detaljer och BAS-analys"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteReceipt && (
                          <button
                            onClick={() => onDeleteReceipt(rec.id)}
                            className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-semibold text-sm text-zinc-100">Underlagsdetaljer</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-zinc-500 hover:text-zinc-200 text-xs px-2 py-1 rounded hover:bg-zinc-800"
              >
                Stäng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 text-[11px] block">Leverantör</span>
                <div className="font-semibold text-zinc-100 text-sm mt-0.5">{selectedReceipt.vendor_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Totalt</span>
                  <div className="text-zinc-100 font-medium tabular-nums">{formatSEK(selectedReceipt.total_amount)}</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Moms ({selectedReceipt.vat_rate}%)</span>
                  <div className="text-zinc-200 font-medium tabular-nums">{formatSEK(selectedReceipt.vat_amount)}</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-[11px] block">Kategori & Kontoplan</span>
                <div className="text-zinc-200 font-medium mt-0.5">{selectedReceipt.category}</div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  BAS {selectedReceipt.raw_ai_response?.bas_account || '6990'}
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-medium block mb-1">
                  Skattemässig motivering:
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {selectedReceipt.raw_ai_response?.reasoning || 'Standard momsavdrag för verksamhetens drift.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800/80">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition"
              >
                Stäng
              </button>
              <button
                onClick={() => {
                  if (onVerifyReceipt) onVerifyReceipt(selectedReceipt.id);
                  setSelectedReceipt(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition"
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
