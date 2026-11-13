'use client';

import React, { useRef } from 'react';
import { Invoice } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Building2, 
  Landmark, 
  QrCode, 
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  companyName: string;
  orgNr: string;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  companyName,
  orgNr,
}: InvoicePreviewModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  // Clean Swedish Org & VAT numbers
  const cleanOrgNr = orgNr || '559123-4567';
  const vatNumber = `SE${cleanOrgNr.replace(/[^0-9]/g, '') || '5591234567'}01`;
  const invoiceNum = invoice.invoice_number || `FAKTURA-${invoice.id.slice(0, 6).toUpperCase()}`;
  const dueDate = invoice.due_date || new Date(new Date(invoice.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // OCR reference (commonly invoice number with Luhn check, or standard invoice number)
  const ocrReference = invoiceNum.replace(/[^0-9]/g, '') || '20260412';

  // Print function using an isolated printable window
  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vänligen tillåt popup-fönster för att skriva ut/ladda ner PDF.');
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
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #18181b;
            background: #ffffff;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 24px;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e4e4e7;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .company-title {
            font-size: 22px;
            font-weight: 800;
            color: #0d3829;
            margin-bottom: 6px;
          }
          .invoice-badge {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 0.05em;
            color: #18181b;
            text-align: right;
          }
          .meta-text {
            color: #52525b;
            font-size: 12px;
            line-height: 1.6;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 28px;
          }
          .info-card {
            background: #fbfbfa;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            padding: 16px;
          }
          .card-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #71717a;
            margin-bottom: 6px;
            display: block;
          }
          .customer-name {
            font-size: 15px;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
            font-size: 12px;
          }
          th {
            background: #f4f4f5;
            color: #3f3f46;
            text-align: left;
            padding: 10px 12px;
            font-weight: 700;
            border-bottom: 1px solid #d4d4d8;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e4e4e7;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .font-bold { font-weight: 700; }
          .totals-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 32px;
          }
          .totals-table {
            width: 320px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
            color: #52525b;
          }
          .total-due {
            border-top: 2px solid #18181b;
            margin-top: 8px;
            padding-top: 10px;
            font-size: 16px;
            font-weight: 900;
            color: #18181b;
            display: flex;
            justify-content: space-between;
          }
          .payment-footer {
            border-top: 1px solid #e4e4e7;
            padding-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            font-size: 11px;
            color: #52525b;
            background: #fafafa;
            border-radius: 8px;
            padding: 16px;
          }
          .swish-box {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 8px;
          }
          .f-skatt-pill {
            display: inline-block;
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 11px;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200 font-semibold">
                  {invoice.status === 'paid' ? 'Betald' : 'Fakturerad'}
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Svensk standardfaktura enligt Mervärdesskattelagen & Bokföringslagen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Ladda ner som PDF eller skriv ut"
            >
              <Printer className="w-4 h-4 text-[#f59e0b]" />
              <span>Ladda ner PDF / Skriv ut</span>
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
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#f7f4ee] flex justify-center">
          
          {/* Printable White A4 Sheet */}
          <div 
            ref={invoiceRef}
            className="w-full max-w-2xl bg-white rounded-xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(28,25,23,0.06)] border border-[#e7e2d7] text-[#1c1917] font-sans space-y-8"
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
                  <div className="pt-1">
                    <span className="inline-block bg-emerald-50 text-[#15803d] border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                      ✔ Innehar F-skattsedel
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black tracking-wider text-[#1c1917] block">
                  FAKTURA
                </span>
                <div className="text-xs text-stone-600 mt-2 font-mono space-y-1">
                  <p>Fakturanr: <strong className="text-[#1c1917]">{invoiceNum}</strong></p>
                  <p>Fakturadatum: <strong>{formatDate(invoice.invoice_date)}</strong></p>
                  <p>Förfallodatum: <strong className="text-[#1c1917] font-bold">{dueDate}</strong></p>
                  <p>Betalningsvillkor: <strong>30 dagar netto</strong></p>
                </div>
              </div>
            </div>

            {/* Customer & Reference Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
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
                  Referenser & Betalning:
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

            {/* Swedish Payment Footer: Bankgiro, Swish, OCR */}
            <div className="border-t-2 border-[#e7e2d7] pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-600 bg-[#f7f4ee] p-5 rounded-xl border border-[#e7e2d7]">
              <div className="space-y-1">
                <span className="font-bold text-[#1c1917] block uppercase tracking-wider text-[10px]">
                  Bankgiro
                </span>
                <span className="font-mono text-sm font-bold text-[#1c1917] block">5050-1055</span>
                <span className="text-[11px] text-stone-500">Mottagare: {companyName}</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#1c1917] block uppercase tracking-wider text-[10px]">
                  Betalningsreferens (OCR)
                </span>
                <span className="font-mono text-sm font-bold text-[#1c1917] block">{invoiceNum}</span>
                <span className="text-[11px] text-stone-500">Ange vid bankinbetalning</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#1c1917] block uppercase tracking-wider text-[10px]">
                  Swish Företag
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#15803d] flex items-center justify-center text-white font-bold text-[10px]">
                    S
                  </div>
                  <span className="font-mono font-bold text-[#1c1917]">123 456 78 90</span>
                </div>
                <span className="text-[11px] text-stone-500">Scanna i Swish-appen</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
