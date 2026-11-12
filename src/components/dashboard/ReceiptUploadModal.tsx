'use client';

import React, { useState, useRef } from 'react';
import { ParsedReceiptData } from '@/types/tax';
import { Receipt } from '@/types/database';
import { formatSEK } from '@/lib/utils';
import { 
  Upload, 
  Check, 
  AlertCircle, 
  X, 
  FileText, 
  Loader2,
  FileCheck2,
  Receipt as ReceiptIcon
} from 'lucide-react';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptAdded: (receipt: Receipt) => void;
}

const PRESET_RECEIPTS = [
  {
    label: 'SJ Tåg (6%)',
    description: 'Stockholm C - Göteborg (Persontransport)',
    text: `SJ AB (Org.nr: 556196-1599)
Bokningsnummer: SJ-892147
Datum: 2026-04-14
Resa: Stockholm C - Göteborg C (Avgång 08:14, 2 klass Lugn)
Biljettpris: 1 127,36 kr
Moms (6%): 67,64 kr
Totalt att betala: 1 195,00 SEK
Betalt med Visa **** 4912
Tack för att du reser klimatsmart med SJ!`,
  },
  {
    label: 'Restaurangfika (12%)',
    description: 'Representation / kundlunch',
    text: `Espresso House Sweden AB
Org.nr: 556555-5555
Datum: 2026-04-16 11:24
Kassa 02 Kvitto #10842
1x Bryggkaffe Stor      45,00 kr
1x Kanelbulle           38,00 kr
1x Caesarsallad Kyckling 102,00 kr
Summa:                 185,00 SEK
Varav Moms 12%:         19,82 SEK
Netto exkl moms:       165,18 SEK
Betalning: Kort godkänd`,
  },
  {
    label: 'Adobe CC (25%)',
    description: 'Programvarulicens för design',
    text: `Adobe Systems Software Ireland Limited
4-6 Riverwalk, Citywest Business Campus, Dublin 24, Ireland
Momsnr / VAT ID: SE502075123401
Fakturanummer: ADB-98412850
Fakturadatum: 2026-04-10
Beskrivning: Adobe Creative Cloud Pro for Teams (1 månad)
Delbelopp: 576,00 SEK
Moms (25%): 144,00 SEK
Totalbelopp: 720,00 SEK
Betald via Mastercard **** 8821`,
  },
  {
    label: 'Stripe Avgifter (0%)',
    description: 'Momsfri finansiell tjänst',
    text: `Stripe Payments Europe, Ltd.
1 Grand Canal Street Lower, Dublin 2, Ireland
Månadsrapport: Transaktionsavgifter och utbetalningskostnader
Datum: 2026-04-30
Transaktioner: E-handelsbetalningar
Avgiftsbelopp: 450,00 SEK
Moms (0% - Finansiell tjänst): 0,00 SEK
Totalt debiterat: 450,00 SEK
Momsfri finansiell omsättning enligt ML 3 kap. 9 §`,
  },
];

export function ReceiptUploadModal({ isOpen, onClose, onReceiptAdded }: ReceiptUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedReceiptData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setActiveTab('text');
    setPastedText(presetText);
    setErrorMsg(null);
  };

  const handleParse = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (activeTab === 'upload' && selectedFile) {
        formData.append('file', selectedFile);
        formData.append('source_type', 'web_upload');
      } else if (pastedText.trim()) {
        formData.append('text', pastedText);
        formData.append('source_type', 'web_upload');
      } else {
        throw new Error('Välj en fil eller klistra in kvittotext först.');
      }

      const res = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Misslyckades med att tolka kvittot.');
      }

      setParsedPreview(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ett fel uppstod vid analys av kvittot.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedPreview) return;

    const newReceipt: Receipt = {
      id: `rec-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      original_file_url: selectedFile ? selectedFile.name : null,
      source_type: 'web_upload',
      vendor_name: parsedPreview.vendor_name,
      invoice_date: parsedPreview.invoice_date,
      currency: parsedPreview.currency || 'SEK',
      total_amount: parsedPreview.total_amount,
      vat_amount: parsedPreview.vat_amount,
      vat_rate: parsedPreview.vat_rate,
      category: parsedPreview.category,
      raw_ai_response: parsedPreview,
      status: 'verified',
      created_at: new Date().toISOString(),
    };

    onReceiptAdded(newReceipt);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPastedText('');
    setParsedPreview(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <ReceiptIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">
                {parsedPreview ? 'Tolkat underlag' : 'Läs in kvitto'}
              </h3>
              <p className="text-xs text-zinc-500">
                {parsedPreview 
                  ? 'Kontrollera tolkade uppgifter mot originalkvittot' 
                  : 'Automatisk tolkning av momssats (25%, 12%, 6%, 0%) och BAS-konto'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab content when NOT parsed */}
        {!parsedPreview ? (
          <div className="space-y-4">
            
            {/* Quick presets row */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-zinc-500">
                Exempelunderlag för snabbtest:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRESET_RECEIPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.text)}
                    className="text-left p-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition shadow-2xs"
                  >
                    <div className="font-semibold text-xs text-zinc-800">
                      {preset.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-zinc-200 text-xs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-2 px-3 font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'upload'
                    ? 'border-zinc-900 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ladda upp fil</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`pb-2 px-3 font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'text'
                    ? 'border-zinc-900 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Klistra in text</span>
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-lg p-7 text-center cursor-pointer transition bg-zinc-50/50 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 mx-auto flex items-center justify-center text-zinc-500 group-hover:text-zinc-900 transition shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="mt-3 text-xs font-semibold text-zinc-800">
                  {selectedFile ? selectedFile.name : 'Välj kvittofil eller dra och släpp här'}
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  JPG, PNG, WEBP eller PDF
                </p>
                {selectedFile && (
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {(selectedFile.size / 1024).toFixed(1)} KB vald
                  </span>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Klistra in kvitto, fakturatext eller e-post här..."
                  rows={6}
                  className="w-full rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-600 focus:bg-white font-mono leading-relaxed transition"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleParse}
                disabled={isLoading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'text' && !pastedText.trim())}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-2 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Tolkar underlag...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Tolka underlag</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Parsed Result Preview Card - Clean Light Mode */
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
              
              {/* Top row: Vendor & Date & Amount */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-200/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200 shadow-2xs">
                      Tolkad
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {parsedPreview.invoice_date}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-zinc-950">
                    {parsedPreview.vendor_name}
                  </h4>
                  {parsedPreview.vendor_org_nr && (
                    <div className="text-[11px] font-mono text-zinc-500">
                      Org.nr: {parsedPreview.vendor_org_nr}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 block">Totalt belopp</span>
                  <div className="text-xl font-bold font-mono text-zinc-950 tabular-nums">
                    {formatSEK(parsedPreview.total_amount)}
                  </div>
                </div>
              </div>

              {/* Financial & Tax Breakdown Ledger */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                  <span className="text-zinc-500 text-[11px] block">Momssats</span>
                  <div className="text-sm font-bold font-mono text-zinc-900 mt-1 tabular-nums">
                    {parsedPreview.vat_rate}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                  <span className="text-zinc-500 text-[11px] block">Avdragsgill moms</span>
                  <div className="text-sm font-bold font-mono text-zinc-900 mt-1 tabular-nums">
                    {formatSEK(parsedPreview.vat_amount)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                  <span className="text-zinc-500 text-[11px] block">Netto exkl. moms</span>
                  <div className="text-sm font-bold font-mono text-zinc-900 mt-1 tabular-nums">
                    {formatSEK(parsedPreview.total_amount - parsedPreview.vat_amount)}
                  </div>
                </div>
              </div>

              {/* Category & BAS Account */}
              <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-zinc-500 block">Kategori</span>
                  <span className="font-semibold text-zinc-800 mt-0.5 block">
                    {parsedPreview.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 block">Kontoplan</span>
                  <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    BAS {parsedPreview.bas_account || '6990'}
                  </span>
                </div>
              </div>

              {/* Tax Justification */}
              {parsedPreview.reasoning && (
                <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-700 block">
                    Skattemässig bedömning:
                  </span>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    {parsedPreview.reasoning}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition"
              >
                Tolka annat kvitto
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Spara underlag</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
