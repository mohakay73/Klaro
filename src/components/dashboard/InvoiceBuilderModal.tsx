'use client';

import React, { useState } from 'react';
import { Invoice, SwedishVatRate } from '@/types/database';
import { formatSEK } from '@/lib/utils';
import { 
  X, 
  Plus, 
  Trash2, 
  Printer, 
  Building2, 
  Calendar, 
  FileText, 
  Check, 
  Eye, 
  Edit3
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: SwedishVatRate;
}

interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
  companyName: string;
  orgNr: string;
}

export function InvoiceBuilderModal({
  isOpen,
  onClose,
  onInvoiceCreated,
  companyName,
  orgNr,
}: InvoiceBuilderModalProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Sender info
  const [senderName, setSenderName] = useState(companyName || 'Lindqvist Digital Design');
  const [senderOrgNr, setSenderOrgNr] = useState(orgNr || '559123-4567');
  const [senderVatNo, setSenderVatNo] = useState(`SE${orgNr.replace(/[^0-9]/g, '') || '5591234567'}01`);
  const [senderBankgiro, setSenderBankgiro] = useState('5123-4567');
  const [senderEmail, setSenderEmail] = useState('faktura@lindqvist.se');

  // Customer info
  const [customerName, setCustomerName] = useState('Spotify AB');
  const [customerOrgNr, setCustomerOrgNr] = useState('556703-7485');
  const [customerAddress, setCustomerAddress] = useState('Regeringsgatan 19, 111 53 Stockholm');
  const [customerReference, setCustomerReference] = useState('Anna Bergman');
  const [ourReference, setOurReference] = useState('Johan Lindqvist');

  // Invoice meta
  const today = new Date().toISOString().split('T')[0];
  const dueDateInitial = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [invoiceNumber, setInvoiceNumber] = useState(`FAKTURA-2026-${Math.floor(Math.random() * 900 + 100)}`);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(dueDateInitial);
  const [paymentTerms, setPaymentTerms] = useState('30 dagar netto');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Senior UI/UX Design & Frontend Prototyping (Sprint Q2)',
      quantity: 60,
      unitPrice: 1250,
      vatRate: 25,
    },
    {
      id: 'item-2',
      description: 'Design System Underhåll & Tokens Export',
      quantity: 1,
      unitPrice: 10000,
      vatRate: 25,
    },
  ]);

  if (!isOpen) return null;

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: 'Konsulttjänster inom mjukvaruutveckling',
        quantity: 10,
        unitPrice: 1100,
        vatRate: 25,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  let subtotal = 0;
  let totalVat = 0;
  for (const item of items) {
    const itemSubtotal = item.quantity * item.unitPrice;
    subtotal += itemSubtotal;
    totalVat += (itemSubtotal * item.vatRate) / 100;
  }
  const totalAmount = subtotal + totalVat;
  const primaryVatRate = items[0]?.vatRate || 25;

  const handleSaveAndSend = () => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      customer_name: customerName,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      currency: 'SEK',
      subtotal_amount: Math.round(subtotal * 100) / 100,
      vat_amount: Math.round(totalVat * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
      vat_rate: primaryVatRate,
      status: 'paid',
      created_at: new Date().toISOString(),
    };

    onInvoiceCreated(newInvoice);
    onClose();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const previewEl = document.getElementById('printable-invoice-preview');
    const content = previewEl ? previewEl.innerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="utf-8">
        <title>${invoiceNumber} - ${customerName}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181b; padding: 20px; font-size: 13px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px 12px; border-bottom: 1px solid #e4e4e7; }
          th { background: #f4f4f5; text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
        </style>
      </head>
      <body>
        ${content}
        <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-t-3xl sm:rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[94vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <FileText className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">Kundfaktura</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
                  Godkänd för F-skatt
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Skapa faktura som automatiskt reserverar moms och skatt i din buffert
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-[#1c1917]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Redigera</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-[#1c1917]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Förhandsgranska</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode: Edit Form */}
        {viewMode === 'edit' ? (
          <div className="space-y-5 text-xs">
            
            {/* Row 1: Customer & Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Customer Box */}
              <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-3">
                <h4 className="font-semibold text-[#1c1917] flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#d97706]" />
                  Mottagare (Kund)
                </h4>
                
                <div>
                  <label className="text-stone-600 font-medium block mb-1">Företagsnamn / Kund</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Spotify AB"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:border-[#1c1917] font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Org.nr</label>
                    <input
                      type="text"
                      value={customerOrgNr}
                      onChange={(e) => setCustomerOrgNr(e.target.value)}
                      placeholder="556703-7485"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Er referens</label>
                    <input
                      type="text"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      placeholder="Anna Bergman"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-600 font-medium block mb-1">Fakturaadress</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Gata, Postnr, Stad"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
              </div>

              {/* Invoice Meta Box */}
              <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-3">
                <h4 className="font-semibold text-[#1c1917] flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#d97706]" />
                  Fakturainformation
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Fakturanummer</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono font-bold focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Vår referens</label>
                    <input
                      type="text"
                      value={ourReference}
                      onChange={(e) => setOurReference(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Fakturadatum</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Förfallodatum</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Bankgiro</label>
                    <input
                      type="text"
                      value={senderBankgiro}
                      onChange={(e) => setSenderBankgiro(e.target.value)}
                      placeholder="5123-4567"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 font-medium block mb-1">Betalningsvillkor</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Line items table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#1c1917]">Fakturarader</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white flex items-center gap-1.5 font-semibold transition text-xs shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Lägg till rad</span>
                </button>
              </div>

              <div className="border border-[#e7e2d7] rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-[#f7f4ee] text-stone-600 border-b border-[#e7e2d7]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Beskrivning</th>
                      <th className="py-2.5 px-3 w-24 font-semibold">Antal</th>
                      <th className="py-2.5 px-3 w-32 font-semibold">À-pris (SEK)</th>
                      <th className="py-2.5 px-3 w-28 font-semibold">Moms</th>
                      <th className="py-2.5 px-3 w-32 text-right font-semibold">Belopp</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e2d7]">
                    {items.map((item) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      return (
                        <tr key={item.id} className="hover:bg-[#f7f4ee]/50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:bg-white focus:border-[#1c1917]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] text-[#1c1917] font-mono tabular-nums focus:outline-none focus:bg-white focus:border-[#1c1917]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] text-[#1c1917] font-mono tabular-nums focus:outline-none focus:bg-white focus:border-[#1c1917]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.vatRate}
                              onChange={(e) => updateItem(item.id, 'vatRate', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] text-[#1c1917] focus:outline-none focus:bg-white focus:border-[#1c1917]"
                            >
                              <option value={25}>25% moms</option>
                              <option value={12}>12% moms</option>
                              <option value={6}>6% moms</option>
                              <option value={0}>0% moms</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#1c1917] tabular-nums">
                            {formatSEK(lineTotal)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length <= 1}
                              className="text-stone-400 hover:text-rose-600 disabled:opacity-30 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] text-stone-600 space-y-1">
                <span className="font-semibold text-[#1c1917] block">
                  Automatisk skattedelning
                </span>
                <p className="text-[11px] leading-relaxed">
                  Vid registrering avskiljs automatiskt <strong>{formatSEK(totalVat)}</strong> till momsreserven och ca <strong>{formatSEK(subtotal * 0.43)}</strong> till F-skatt, vilket uppdaterar ditt säkra disponibla belopp.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Netto exkl. moms:</span>
                  <span className="text-[#1c1917] font-semibold tabular-nums">{formatSEK(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Utgående moms ({primaryVatRate}%):</span>
                  <span className="text-[#1c1917] font-semibold tabular-nums">{formatSEK(totalVat)}</span>
                </div>
                <div className="border-t border-[#e7e2d7] pt-2 flex justify-between text-sm font-bold text-[#1c1917]">
                  <span>Totalt att betala:</span>
                  <span className="tabular-nums">{formatSEK(totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* View Mode: High-End Swedish Invoice Layout View */
          <div id="printable-invoice-preview" className="bg-white text-[#1c1917] rounded-xl p-8 space-y-8 font-sans shadow-xs border border-[#e7e2d7]">
            {/* Header: Company & Faktura title */}
            <div className="flex justify-between items-start border-b border-[#e7e2d7] pb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1c1917]">{senderName}</h2>
                <div className="text-xs text-stone-600 mt-1 space-y-0.5">
                  <p>Org.nr: <span className="font-mono">{senderOrgNr}</span></p>
                  <p>Momsreg.nr: <span className="font-mono">{senderVatNo}</span></p>
                  <p className="text-[#1c1917] font-semibold">Godkänd för F-skatt</p>
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-2xl font-black text-[#1c1917] tracking-wider">FAKTURA</h1>
                <div className="text-xs text-stone-600 mt-2 font-mono space-y-0.5">
                  <p>Fakturanr: <strong>{invoiceNumber}</strong></p>
                  <p>Fakturadatum: {invoiceDate}</p>
                  <p>Förfallodatum: <strong className="text-[#1c1917]">{dueDate}</strong></p>
                </div>
              </div>
            </div>

            {/* Customer & Reference */}
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div className="bg-[#f7f4ee] p-4 rounded-xl border border-[#e7e2d7]">
                <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block">Faktureras till:</span>
                <h4 className="font-bold text-sm text-[#1c1917] mt-1">{customerName}</h4>
                <p className="text-stone-600 mt-0.5">{customerAddress}</p>
                <p className="text-stone-600 mt-1 font-mono">Org.nr: {customerOrgNr}</p>
              </div>

              <div className="bg-[#f7f4ee] p-4 rounded-xl border border-[#e7e2d7] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block">Referenser & Villkor:</span>
                <p className="text-stone-700">Vår referens: <strong>{ourReference}</strong></p>
                <p className="text-stone-700">Er referens: <strong>{customerReference}</strong></p>
                <p className="text-stone-700">Betalningsvillkor: <strong>{paymentTerms}</strong></p>
                <p className="text-stone-500 text-[11px]">Dröjsmålsränta: Referensränta + 8%</p>
              </div>
            </div>

            {/* Articles Table */}
            <div className="border border-[#e7e2d7] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f4ee] text-stone-700 font-semibold border-b border-[#e7e2d7]">
                  <tr>
                    <th className="py-2.5 px-4">Beskrivning</th>
                    <th className="py-2.5 px-4 text-center">Antal</th>
                    <th className="py-2.5 px-4 text-right">À-pris (SEK)</th>
                    <th className="py-2.5 px-4 text-center">Moms</th>
                    <th className="py-2.5 px-4 text-right">Belopp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e2d7]">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 font-medium text-[#1c1917]">{item.description}</td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{formatSEK(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.vatRate}%</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {formatSEK(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-600">
                  <span>Totalt exkl. moms:</span>
                  <span className="tabular-nums">{formatSEK(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Moms ({primaryVatRate}%):</span>
                  <span className="tabular-nums">{formatSEK(totalVat)}</span>
                </div>
                <div className="border-t-2 border-[#1c1917] pt-2 flex justify-between text-sm font-bold text-[#1c1917]">
                  <span>ATT BETALA:</span>
                  <span className="tabular-nums">{formatSEK(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment instructions */}
            <div className="border-t border-[#e7e2d7] pt-4 grid grid-cols-3 gap-4 text-xs text-stone-600">
              <div>
                <span className="font-semibold text-[#1c1917] block">Bankgiro</span>
                <span className="font-mono">{senderBankgiro}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1c1917] block">Fakturanummer som ref</span>
                <span className="font-mono">{invoiceNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1c1917] block">E-post</span>
                <span>{senderEmail}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e7e2d7]">
          {viewMode === 'preview' ? (
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Skriv ut / PDF</span>
            </button>
          ) : (
            <div className="text-[11px] text-stone-500">
              Krav enligt Mervärdesskattelagen uppfylls.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-[#e7e2d7] hover:bg-[#f7f4ee] text-stone-700 text-xs font-medium transition cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSaveAndSend}
              className="px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Spara & Se PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
