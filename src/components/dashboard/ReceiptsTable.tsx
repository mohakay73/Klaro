'use client';

import React, { useState } from 'react';
import { Receipt, SwedishVatRate } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { SWEDISH_BAS_CATEGORIES } from '@/types/tax';
import { 
  Receipt as ReceiptIcon, 
  Mail, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Info, 
  Sparkles,
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
          <span title="Inkommit via Resend e-postvidarebefordran">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
          </span>
        );
      case 'mobile_scan':
        return (
          <span title="Mobilskanning">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          </span>
        );
      default:
        return (
          <span title="Webbuppladdning">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        );
    }
  };

  const getVatBadgeClass = (rate: number) => {
    switch (rate) {
      case 25:
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 12:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 6:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReceiptIcon className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Inlästa Kvitton & Utgifter ({receipts.length})</h4>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
            BAS-kontoplan 2026
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onExportSIE && (
            <button
              onClick={onExportSIE}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              title="Ladda ner SIE-4 fil för Fortnox, Visma eller Bokio"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportera SIE-4 fil</span>
            </button>
          )}
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-sm">
          Inga kvitton inlästa ännu. Klicka på "Tolka Kvitto (AI)" eller vidarebefordra till din Klaro e-postadress.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Datum</th>
                <th className="py-3 px-4 font-medium">Leverantör & BAS-konto</th>
                <th className="py-3 px-4 font-medium">Källa</th>
                <th className="py-3 px-4 font-medium">Momssats</th>
                <th className="py-3 px-4 font-medium text-right">Momsbelopp</th>
                <th className="py-3 px-4 font-medium text-right">Totalt (SEK)</th>
                <th className="py-3 px-4 font-medium">Status & Revision</th>
                <th className="py-3 px-4 font-medium text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {receipts.map((rec) => {
                const isAmbiguous = rec.status === 'parsed' && (rec.vat_rate === 12 || rec.total_amount > 2000);

                return (
                  <tr key={rec.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono">
                      {formatDate(rec.invoice_date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                        <span>{rec.vendor_name}</span>
                        {isAmbiguous && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
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

                      {/* Edge-case prompt for ambiguous items */}
                      {isAmbiguous && onUpdateReceiptVatRate && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-400 bg-amber-950/20 p-1 rounded border border-amber-800/30">
                          <span>Är detta:</span>
                          <button
                            onClick={() => onUpdateReceiptVatRate(rec.id, 12)}
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              rec.vat_rate === 12 ? 'bg-amber-500 text-zinc-950 font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            12% representation
                          </button>
                          <span>eller</span>
                          <button
                            onClick={() => onUpdateReceiptVatRate(rec.id, 25)}
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              rec.vat_rate === 25 ? 'bg-purple-500 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
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
                          {rec.source_type === 'email_forward' ? 'E-post' : rec.source_type === 'mobile_scan' ? 'Mobil' : 'Webb'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${getVatBadgeClass(rec.vat_rate)}`}>
                        {rec.vat_rate}% moms
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-emerald-400 font-medium">
                      {formatSEK(rec.vat_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold text-zinc-100">
                      {formatSEK(rec.total_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reviderad & Klar
                        </span>
                      ) : (
                        <button
                          onClick={() => onVerifyReceipt && onVerifyReceipt(rec.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-emerald-300 font-medium transition"
                          title="Klicka för att godkänna momsavdrag"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          AI-tolkad (Verifiera)
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(rec)}
                          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                          title="Visa AI-motivering och BAS-analys"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {onDeleteReceipt && (
                          <button
                            onClick={() => onDeleteReceipt(rec.id)}
                            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition"
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
      )}

      {/* AI Reasoning Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-white">AI Skattetolkningsrapport</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-zinc-800"
              >
                Stäng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500">Leverantör:</span>
                <div className="font-medium text-zinc-200 text-sm mt-0.5">{selectedReceipt.vendor_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono">
                <div>
                  <span className="text-zinc-500 text-[11px]">Totalt:</span>
                  <div className="text-zinc-200 font-semibold">{formatSEK(selectedReceipt.total_amount)}</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px]">Avdragsgill moms:</span>
                  <div className="text-emerald-400 font-semibold">{formatSEK(selectedReceipt.vat_amount)} ({selectedReceipt.vat_rate}%)</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500">BAS-kontoplan & Kategori:</span>
                <div className="text-zinc-300 font-medium mt-0.5">{selectedReceipt.category}</div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Konto: {selectedReceipt.raw_ai_response?.bas_account || '6990'}
                </div>
              </div>

              <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                  Skatteverkets motivering:
                </span>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {selectedReceipt.raw_ai_response?.reasoning || 'Standard momsavdrag godkänt för verksamhetens drift.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (onVerifyReceipt) onVerifyReceipt(selectedReceipt.id);
                  setSelectedReceipt(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition"
              >
                Markera som godkänd
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
