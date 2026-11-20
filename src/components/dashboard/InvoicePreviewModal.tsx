'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Invoice } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { generateSwishQrSvg, getSwishDeepLink } from '@/lib/swish-qr';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Building2, 
  Landmark, 
  QrCode, 
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  companyName: string;
  orgNr: string;
  bankgiro?: string;
  swishNumber?: string;
  hasFSkatt?: boolean;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  companyName,
  orgNr,
  bankgiro = '5050-1055',
  swishNumber = '123 456 78 90',
  hasFSkatt = true,
}: InvoicePreviewModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [swishSvg, setSwishSvg] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cleanOrgNr = orgNr || '559123-4567';
  const vatNumber = `SE${cleanOrgNr.replace(/[^0-9]/g, '') || '5591234567'}01`;
  const invoiceNum = invoice?.invoice_number || (invoice?.id ? `FAKTURA-${invoice.id.slice(0, 6).toUpperCase()}` : 'FAKTURA-1001');
  const dueDate = invoice?.due_date || (invoice?.invoice_date ? new Date(new Date(invoice.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '2026-12-15');
  const ocrReference = invoiceNum.replace(/[^0-9]/g, '') || '20261001';

  // Generate dynamic Swish QR code on open
  useEffect(() => {
    if (!isOpen || !invoice) return;

    let isMounted = true;
    generateSwishQrSvg({
      payee: swishNumber,
      amount: invoice.total_amount,
      message: invoiceNum,
    }).then((svg) => {
      if (isMounted) {
        setSwishSvg(svg);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, invoice, swishNumber, invoiceNum]);

  if (!isOpen || !invoice) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const swishDeepLink = getSwishDeepLink({
    payee: swishNumber,
    amount: invoice.total_amount,
    message: invoiceNum,
  });

  // Print function generating vector PDF via system print
  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vänligen tillåt popup-fönster för att skriva ut eller ladda ner fakturan som PDF.');
      return;
    }

    const invoiceHtml = invoiceRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="utf-8">
        <title>${invoiceNum} - ${invoice.customer_name}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1c1917;
            background: #ffffff;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-sheet {
            width: 100%;
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #f7f4ee;
            color: #1c1917;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 700;
            border-bottom: 2px solid #e7e2d7;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e7e2d7;
            font-size: 12px;
          }
          .font-mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .tabular-nums { font-variant-numeric: tabular-nums; }
          .swish-qr-svg svg {
            width: 90px;
            height: 90px;
            display: block;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="invoice-sheet">
          ${invoiceHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-[#e7e2d7] overflow-hidden my-0 sm:my-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto mt-2 -mb-1 sm:hidden" />

        {/* Top Control Bar */}
        <div className="p-4 sm:px-6 border-b border-[#e7e2d7] bg-[#f7f4ee] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917] flex items-center justify-center text-[#f59e0b] font-bold text-xs shadow-xs border border-[#e7e2d7]">
              PDF
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1c1917] flex items-center gap-2">
                <span>{invoiceNum}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                  invoice.status === 'paid' 
                    ? 'bg-emerald-50 text-[#15803d] border-emerald-200' 
                    : 'bg-amber-50 text-[#b45309] border-amber-200'
                }`}>
                  {invoice.status === 'paid' ? 'Betald' : 'Väntar på betalning'}
                </span>
                {hasFSkatt && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>F-skatt</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500">
                Svensk standardfaktura med Swish Företag QR-kod & Bankgiro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              title="Skriv ut eller spara som PDF"
            >
              <Download className="w-4 h-4 text-[#f59e0b]" />
              <span className="hidden sm:inline">Ladda ner PDF / Skriv ut</span>
              <span className="sm:hidden">Ladda ner PDF</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-[#eee8dc] rounded-lg transition cursor-pointer"
              title="Stäng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f7f4ee] flex justify-center">
          
          {/* Printable White A4 Sheet */}
          <div 
            ref={invoiceRef}
            className="w-full max-w-2xl bg-white rounded-xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(28,25,23,0.06)] border border-[#e7e2d7] text-[#1c1917] font-sans space-y-7"
          >
            {/* Header: Company & Faktura Title */}
            <div className="flex justify-between items-start border-b-2 border-[#e7e2d7] pb-6">
              <div>
                <h1 className="text-2xl font-black text-[#1c1917] tracking-tight">
                  {companyName}
                </h1>
                <div className="text-xs text-stone-600 mt-1.5 space-y-0.5 font-sans">
                  <p>Organisationsnummer: <strong className="font-mono text-[#1c1917]">{cleanOrgNr}</strong></p>
                  <p>Momsregistreringsnummer: <strong className="font-mono text-[#1c1917]">{vatNumber}</strong></p>
                  <div className="pt-1.5 flex items-center gap-2">
                    {hasFSkatt ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#15803d] border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        <Check className="w-3 h-3 text-[#15803d]" />
                        <span>Godkänd för F-skatt</span>
                      </span>
                    ) : (
                      <span className="inline-block bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        Ej godkänd för F-skatt
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black tracking-wider text-[#1c1917] block">
                  FAKTURA
                </span>
                <div className="text-xs text-stone-600 mt-2 font-mono space-y-1">
                  <p>Fakturanummer: <strong className="text-[#1c1917]">{invoiceNum}</strong></p>
                  <p>Fakturadatum: <strong>{formatDate(invoice.invoice_date)}</strong></p>
                  <p>Förfallodatum: <strong className="text-[#1c1917] font-bold">{dueDate}</strong></p>
                  <p>Betalningsvillkor: <strong>30 dagar netto</strong></p>
                </div>
              </div>
            </div>

            {/* Customer & Reference Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#f7f4ee] p-4 rounded-xl border border-[#e7e2d7] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  Faktureras till:
                </span>
                <div className="text-base font-bold text-[#1c1917]">
                  {invoice.customer_name}
                </div>
                <div className="text-stone-600">
                  Regeringsgatan 19, 111 53 Stockholm
                </div>
                <div className="text-stone-500 font-mono pt-1">
                  Org.nr: 556703-7485
                </div>
              </div>

              <div className="bg-[#f7f4ee] p-4 rounded-xl border border-[#e7e2d7] space-y-1.5 text-stone-700">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  Referenser & Dröjsmål:
                </span>
                <div className="flex justify-between">
                  <span>Vår referens:</span>
                  <strong className="text-[#1c1917]">{companyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Er referens:</span>
                  <strong className="text-[#1c1917]">Ekonomiavdelningen</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dröjsmålsränta:</span>
                  <span>Referensränta + 8,00%</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[#e7e2d7] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f4ee] text-stone-700 font-bold border-b border-[#e7e2d7]">
                  <tr>
                    <th className="py-3 px-4">Beskrivning av tjänst / vara</th>
                    <th className="py-3 px-4 text-center">Antal</th>
                    <th className="py-3 px-4 text-right">À-pris (SEK)</th>
                    <th className="py-3 px-4 text-center">Moms</th>
                    <th className="py-3 px-4 text-right">Belopp (exkl. moms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e2d7]">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[#1c1917]">
                      Konsulttjänster och digital rådgivning (Period {formatDate(invoice.invoice_date)})
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">1</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">{formatSEK(invoice.subtotal_amount)}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">{invoice.vat_rate}%</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      {formatSEK(invoice.subtotal_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Breakdown & Total Due */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">Nettobelopp exkl. moms:</span>
                  <span className="tabular-nums font-semibold text-[#1c1917]">{formatSEK(invoice.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">Mervärdesskatt ({invoice.vat_rate}%):</span>
                  <span className="tabular-nums font-semibold text-[#1c1917]">{formatSEK(invoice.vat_amount)}</span>
                </div>
                <div className="border-t-2 border-[#1c1917] pt-2.5 flex justify-between text-base font-black text-[#1c1917]">
                  <span className="font-sans font-bold">ATT BETALA (SEK):</span>
                  <span className="tabular-nums font-mono text-[#1c1917]">{formatSEK(invoice.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section: Bankgiro + Swish with Dynamic QR Code */}
            <div className="border-t-2 border-[#e7e2d7] pt-5">
              <div className="bg-[#f7f4ee] p-5 rounded-xl border border-[#e7e2d7] grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* Left: Bankgiro & OCR reference */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-[#1c1917]" />
                    <span className="font-bold text-[#1c1917] uppercase tracking-wider text-[11px]">
                      Betalningsinformation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-lg border border-[#e7e2d7]">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Bankgiro</span>
                      <span className="font-mono text-sm font-bold text-[#1c1917] block mt-0.5">{bankgiro}</span>
                      <span className="text-[10px] text-stone-500 truncate block">Mottagare: {companyName}</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#e7e2d7]">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Referens (OCR)</span>
                      <span className="font-mono text-sm font-bold text-[#1c1917] block mt-0.5">{invoiceNum}</span>
                      <span className="text-[10px] text-stone-500 block">Ange vid betalning</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-stone-500">
                    Betalning ska vara oss tillhanda senast förfallodagen <strong>{dueDate}</strong>.
                  </div>
                </div>

                {/* Right: Dynamic Swish Företag QR Code */}
                <div className="sm:col-span-5 bg-white p-3.5 rounded-xl border border-[#e7e2d7] flex items-center gap-3.5 shadow-2xs">
                  <div className="w-24 h-24 shrink-0 bg-white rounded-lg p-1 border border-[#e7e2d7] flex items-center justify-center swish-qr-svg">
                    {swishSvg ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: swishSvg }}
                        className="w-full h-full flex items-center justify-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100 rounded text-stone-400">
                        <QrCode className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#15803d] text-white text-[9px] font-bold flex items-center justify-center">
                        S
                      </span>
                      <span className="font-bold text-[#1c1917] text-xs">Swish Företag</span>
                    </div>
                    <p className="font-mono font-bold text-[#1c1917] text-xs">
                      {swishNumber}
                    </p>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Scanna med Swish-appen för ifylld betalning
                    </p>
                    <div className="pt-1">
                      <a
                        href={swishDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803d] hover:underline"
                      >
                        <span>Öppna i Swish</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Official Disclaimer Footer */}
            <div className="pt-2 text-center text-[10px] text-stone-400 border-t border-[#e7e2d7]">
              <span>{companyName} • Org.nr {cleanOrgNr} • Momsnr {vatNumber} • {hasFSkatt ? 'Godkänd för F-skatt' : 'Ej godkänd för F-skatt'}</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
