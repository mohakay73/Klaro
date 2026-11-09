'use client';

import React, { useState, useRef } from 'react';
import { ParsedReceiptData, SwedishVatRate } from '@/types/tax';
import { Receipt } from '@/types/database';
import { formatSEK } from '@/lib/utils';
import { 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle, 
  X, 
  FileText, 
  Building2, 
  Layers, 
  Loader2,
  Zap
} from 'lucide-react';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptAdded: (receipt: Receipt) => void;
}

const PRESET_RECEIPTS = [
  {
    label: 'SJ Tåg (6% moms)',
    description: 'Inrikes persontransport Stockholm C - Göteborg',
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
    label: 'Restaurangfika (12% moms)',
    description: 'Representation & kundlunch på Espresso House',
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
    label: 'Adobe CC (25% moms)',
    description: 'Programvarulicens för grafisk design & kod',
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
    label: 'Stripe Avgifter (0% moms)',
    description: 'Finansiella transaktionsavgifter & banktjänster',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">AI Kvittoinläsning & Svensk Momstolkning</h3>
              <p className="text-xs text-zinc-400">Automatisk kategorisering till 25%, 12%, 6% eller 0% moms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets row */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-zinc-300">Snabbtesta svenska momssatser:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_RECEIPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.text)}
                className="text-left p-2 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 hover:border-zinc-700 transition group"
              >
                <div className="font-medium text-xs text-emerald-400 group-hover:text-emerald-300">
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
        <div className="flex border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'upload'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Filuppladdning (PDF / Bild)</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'text'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Klistra in kvittotext</span>
          </button>
        </div>

        {/* Tab content */}
        {!parsedPreview ? (
          <div className="space-y-4">
            {activeTab === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-xl p-8 text-center cursor-pointer transition bg-zinc-950/40 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="mt-3 text-sm font-medium text-zinc-200">
                  {selectedFile ? selectedFile.name : 'Dra och släpp kvitto här, eller klicka för att välja'}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Stödjer PNG, JPG, WEBP och PDF-fakturor
                </p>
                {selectedFile && (
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Vald fil: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Klistra in text från en e-faktura, kvitto från ICA, SJ, Adobe eller e-post här..."
                  rows={6}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleParse}
                disabled={isLoading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'text' && !pastedText.trim())}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 text-xs font-semibold transition flex items-center gap-2 shadow-sm shadow-emerald-950"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyserar med svensk skattelogik...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tolka Kvitto med AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Parsed Result Preview Card */
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                    Tolkningsresultat (Godkänd)
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{parsedPreview.vendor_name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-white">
                    {formatSEK(parsedPreview.total_amount)}
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{parsedPreview.invoice_date}</span>
                </div>
              </div>

              {/* Tax logic grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[11px]">Svensk momssats:</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {parsedPreview.vat_rate}% moms
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[11px]">Avdragsgill moms:</span>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {formatSEK(parsedPreview.vat_amount)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-zinc-500 text-[11px]">Netto kostnad:</span>
                  <div className="text-sm font-bold font-mono text-zinc-300 mt-0.5">
                    {formatSEK(parsedPreview.total_amount - parsedPreview.vat_amount)}
                  </div>
                </div>
              </div>

              {/* Category & BAS Account */}
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-300">Bokföringskategori:</span>
                  <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    BAS-konto {parsedPreview.bas_account || '6990'}
                  </span>
                </div>
                <p className="text-zinc-400">{parsedPreview.category}</p>
              </div>

              {/* Skatteverket justification */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Check className="w-3.5 h-3.5" />
                  Skatteverket Motivering:
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  {parsedPreview.reasoning}
                </p>
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition"
              >
                Tolka ett annat kvitto
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                <Check className="w-4 h-4" />
                <span>Lägg till i skattebufferten</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
