'use client';

import React, { useState } from 'react';
import { Invoice, SwedishVatRate } from '@/types/database';
import { X, Plus, Building } from 'lucide-react';
import { formatSEK } from '@/lib/utils';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceAdded: (invoice: Invoice) => void;
}

export function AddInvoiceModal({ isOpen, onClose, onInvoiceAdded }: AddInvoiceModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(
    `FAKTURA-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`
  );
  const [totalAmount, setTotalAmount] = useState<number | ''>(50000);
  const [vatRate, setVatRate] = useState<SwedishVatRate>(25);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const total = Number(totalAmount) || 0;
  const vat = vatRate > 0 ? Math.round((total - total / (1 + vatRate / 100)) * 100) / 100 : 0;
  const subtotal = Math.round((total - vat) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !totalAmount) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      customer_name: customerName,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      currency: 'SEK',
      subtotal_amount: subtotal,
      vat_amount: vat,
      total_amount: total,
      vat_rate: vatRate,
      status: 'paid',
      created_at: new Date().toISOString(),
    };

    onInvoiceAdded(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <Plus className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1c1917]">Registrera Kundfaktura (Intäkt)</h3>
              <p className="text-xs text-stone-500">Lägg till intäkt för att uppdatera moms- och skattebufferten</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-[#f7f4ee] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Kundnamn</label>
            <div className="relative">
              <Building className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="T.ex. Spotify AB, Voi Technology eller Kundföretag"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] placeholder-stone-400 focus:outline-none focus:border-[#1c1917]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Fakturanummer</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Fakturadatum</label>
              <div className="relative">
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Totalt Fakturabelopp (SEK inkl. moms)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono font-bold focus:outline-none focus:border-[#1c1917]"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Momssats</label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value) as SwedishVatRate)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-medium focus:outline-none focus:border-[#1c1917]"
              >
                <option value={25}>25% Moms (Konsult, Utveckling, Standard)</option>
                <option value={12}>12% Moms (Hotell, Mat, Catering)</option>
                <option value={6}>6% Moms (Kultur, Resor, Böcker)</option>
                <option value={0}>0% Moms (Momsfritt / Omvänd skattskyldighet)</option>
              </select>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] font-mono space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Netto intäkt (exkl moms):</span>
              <span className="text-[#1c1917] font-semibold">{formatSEK(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Utgående moms till Skatteverket:</span>
              <span className="text-[#b45309] font-semibold">{formatSEK(vat)} ({vatRate}%)</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e7e2d7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e7e2d7] hover:bg-[#f7f4ee] text-stone-700 font-medium transition cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#f59e0b]" />
              <span>Spara Faktura</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
