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
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-100">Kundfaktura</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Godkänd för F-skatt
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Skapa faktura som automatiskt reserverar moms och skatt i din buffert
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'edit'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Redigera</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'preview'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Förhandsgranska</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 transition"
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
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  Mottagare (Kund)
                </h4>
                
                <div>
                  <label className="text-zinc-400 block mb-1">Företagsnamn / Kund</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Spotify AB"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Org.nr</label>
                    <input
                      type="text"
                      value={customerOrgNr}
                      onChange={(e) => setCustomerOrgNr(e.target.value)}
                      placeholder="556703-7485"
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Er referens</label>
                    <input
                      type="text"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      placeholder="Anna Bergman"
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Fakturaadress</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Gata, Postnr, Stad"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Invoice Meta Box */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Fakturainformation
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Fakturanummer</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono font-medium focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Vår referens</label>
                    <input
                      type="text"
                      value={ourReference}
                      onChange={(e) => setOurReference(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Fakturadatum</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Förfallodatum</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Bankgiro</label>
                    <input
                      type="text"
                      value={senderBankgiro}
                      onChange={(e) => setSenderBankgiro(e.target.value)}
                      placeholder="5123-4567"
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Betalningsvillkor</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Line items table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-zinc-200">Fakturarader</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 font-medium transition text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lägg till rad</span>
                </button>
              </div>

              <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/70">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-2 px-3">Beskrivning</th>
                      <th className="py-2 px-3 w-24">Antal</th>
                      <th className="py-2 px-3 w-32">À-pris (SEK)</th>
                      <th className="py-2 px-3 w-28">Moms</th>
                      <th className="py-2 px-3 w-32 text-right">Belopp</th>
                      <th className="py-2 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {items.map((item) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      return (
                        <tr key={item.id} className="hover:bg-zinc-900/40">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono tabular-nums focus:outline-none focus:border-zinc-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono tabular-nums focus:outline-none focus:border-zinc-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.vatRate}
                              onChange={(e) => updateItem(item.id, 'vatRate', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-500"
                            >
                              <option value={25}>25% moms</option>
                              <option value={12}>12% moms</option>
                              <option value={6}>6% moms</option>
                              <option value={0}>0% moms</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-zinc-200 tabular-nums">
                            {formatSEK(lineTotal)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length <= 1}
                              className="text-zinc-600 hover:text-red-400 disabled:opacity-30 transition"
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
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-zinc-400 space-y-1">
                <span className="font-medium text-zinc-300 block">
                  Automatisk skattedelning
                </span>
                <p className="text-[11px] leading-relaxed">
                  Vid registrering avskiljs automatiskt <strong>{formatSEK(totalVat)}</strong> till momsreserven och ca <strong>{formatSEK(subtotal * 0.43)}</strong> till F-skatt, vilket uppdaterar ditt säkra disponibla belopp.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Netto exkl. moms:</span>
                  <span className="text-zinc-200 tabular-nums">{formatSEK(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Utgående moms ({primaryVatRate}%):</span>
                  <span className="text-zinc-200 tabular-nums">{formatSEK(totalVat)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-semibold text-white">
                  <span>Totalt att betala:</span>
                  <span className="tabular-nums">{formatSEK(totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* View Mode: High-End Swedish Invoice Layout View */
          <div className="bg-white text-zinc-900 rounded-lg p-8 space-y-8 font-sans shadow-lg border border-zinc-200">
            {/* Header: Company & Faktura title */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950">{senderName}</h2>
                <div className="text-xs text-zinc-600 mt-1 space-y-0.5">
                  <p>Org.nr: <span className="font-mono">{senderOrgNr}</span></p>
                  <p>Momsreg.nr: <span className="font-mono">{senderVatNo}</span></p>
                  <p className="text-zinc-700 font-medium">Godkänd för F-skatt</p>
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-2xl font-bold text-zinc-950 tracking-wider">FAKTURA</h1>
                <div className="text-xs text-zinc-600 mt-2 font-mono space-y-0.5">
                  <p>Fakturanr: <strong>{invoiceNumber}</strong></p>
                  <p>Fakturadatum: {invoiceDate}</p>
                  <p>Förfallodatum: <strong className="text-zinc-950">{dueDate}</strong></p>
                </div>
              </div>
            </div>

            {/* Customer & Reference */}
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Faktureras till:</span>
                <h4 className="font-semibold text-sm text-zinc-900 mt-1">{customerName}</h4>
                <p className="text-zinc-600 mt-0.5">{customerAddress}</p>
                <p className="text-zinc-600 mt-1 font-mono">Org.nr: {customerOrgNr}</p>
              </div>

              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Referenser & Villkor:</span>
                <p className="text-zinc-700">Vår referens: <strong>{ourReference}</strong></p>
                <p className="text-zinc-700">Er referens: <strong>{customerReference}</strong></p>
                <p className="text-zinc-700">Betalningsvillkor: <strong>{paymentTerms}</strong></p>
                <p className="text-zinc-500 text-[11px]">Dröjsmålsränta: Referensränta + 8%</p>
              </div>
            </div>

            {/* Articles Table */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-4">Beskrivning</th>
                    <th className="py-2.5 px-4 text-center">Antal</th>
                    <th className="py-2.5 px-4 text-right">À-pris (SEK)</th>
                    <th className="py-2.5 px-4 text-center">Moms</th>
                    <th className="py-2.5 px-4 text-right">Belopp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 font-medium text-zinc-900">{item.description}</td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{formatSEK(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.vatRate}%</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
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
                <div className="flex justify-between text-zinc-600">
                  <span>Totalt exkl. moms:</span>
                  <span className="tabular-nums">{formatSEK(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Moms ({primaryVatRate}%):</span>
                  <span className="tabular-nums">{formatSEK(totalVat)}</span>
                </div>
                <div className="border-t border-zinc-900 pt-2 flex justify-between text-sm font-bold text-zinc-950">
                  <span>ATT BETALA:</span>
                  <span className="tabular-nums">{formatSEK(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment instructions */}
            <div className="border-t border-zinc-200 pt-4 grid grid-cols-3 gap-4 text-xs text-zinc-600">
              <div>
                <span className="font-semibold text-zinc-900 block">Bankgiro</span>
                <span className="font-mono">{senderBankgiro}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-900 block">Fakturanummer som ref</span>
                <span className="font-mono">{invoiceNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-900 block">E-post</span>
                <span>{senderEmail}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          {viewMode === 'preview' ? (
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Skriv ut / PDF</span>
            </button>
          ) : (
            <div className="text-[11px] text-zinc-500">
              Krav enligt Mervärdesskattelagen uppfylls.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSaveAndSend}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Spara faktura</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
