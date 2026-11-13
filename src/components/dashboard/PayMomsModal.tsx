'use client';

import React, { useState } from 'react';
import { generateSkatteverketOCR, SKATTEVERKET_BANKGIRO, SKATTEVERKET_RECEIVER } from '@/lib/skatteverket-ocr';
import { formatSEK } from '@/lib/utils';
import { X, Copy, Check, Landmark, ShieldCheck } from 'lucide-react';

interface PayMomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  netMoms: number;
  orgNr: string;
  companyName: string;
  dueDate: string;
}

export function PayMomsModal({
  isOpen,
  onClose,
  netMoms,
  orgNr,
  companyName,
  dueDate,
}: PayMomsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const ocrNumber = generateSkatteverketOCR(orgNr || '559123-4567');
  const amountToPay = Math.max(0, Math.round(netMoms));

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <Landmark className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1c1917]">Inbetalning till Skattekontot</h3>
              <p className="text-xs text-stone-500">Skatteverkets Bankgiro och unikt OCR-referensnummer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount to pay hero card */}
        <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] text-center space-y-1">
          <span className="text-[11px] uppercase font-semibold tracking-wider text-stone-500 block">
            Netto moms att inbetala
          </span>
          <div className="text-3xl font-extrabold font-mono text-[#1c1917] tabular-nums">
            {formatSEK(amountToPay)}
          </div>
          <div className="text-xs text-stone-500 pt-1 font-mono">
            Förfallodatum: <span className="text-[#b45309] font-bold">{dueDate}</span>
          </div>
        </div>

        {/* Bankgiro & OCR Details */}
        <div className="space-y-2.5 text-xs">
          
          {/* Mottagare */}
          <div className="p-3 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 block">Mottagare</span>
              <div className="font-semibold text-stone-800 mt-0.5">{SKATTEVERKET_RECEIVER}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-700 border border-[#e7e2d7]">
              Skattekonto
            </span>
          </div>

          {/* Bankgiro */}
          <div className="p-3 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 block">Bankgironummer</span>
              <div className="font-mono font-bold text-sm text-[#1c1917] mt-0.5">
                {SKATTEVERKET_BANKGIRO}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(SKATTEVERKET_BANKGIRO, 'bg')}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#eee8dc] text-stone-800 flex items-center gap-1.5 transition text-[11px] font-semibold border border-[#e7e2d7] shadow-2xs cursor-pointer"
            >
              {copiedField === 'bg' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>Kopierat</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kopiera BG</span>
                </>
              )}
            </button>
          </div>

          {/* OCR-nummer */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#b45309] font-semibold block">
                Ditt OCR-nummer (Luhn-kontroll)
              </span>
              <div className="font-mono font-black text-base text-[#1c1917] tracking-wider mt-0.5 tabular-nums">
                {ocrNumber}
              </div>
              <span className="text-[10px] text-stone-500">Kopplat till Org.nr {orgNr}</span>
            </div>
            <button
              onClick={() => copyToClipboard(ocrNumber, 'ocr')}
              className="px-3 py-1.5 rounded-lg bg-[#1c1917] hover:bg-[#292524] text-white flex items-center gap-1.5 transition text-[11px] font-semibold shadow-xs cursor-pointer"
            >
              {copiedField === 'ocr' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-300" />
                  <span>Kopiera OCR</span>
                </>
              )}
            </button>
          </div>

          {/* Belopp */}
          <div className="p-3 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 block">Exakt belopp (SEK)</span>
              <div className="font-mono font-bold text-sm text-[#1c1917] mt-0.5 tabular-nums">
                {amountToPay} kr
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(amountToPay.toString(), 'amount')}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#eee8dc] text-stone-800 flex items-center gap-1.5 transition text-[11px] font-semibold border border-[#e7e2d7] shadow-2xs cursor-pointer"
            >
              {copiedField === 'amount' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>Kopierat</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kopiera belopp</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Security / Verification note */}
        <div className="p-3 rounded-lg bg-[#f7f4ee] border border-[#e7e2d7] text-[11px] text-stone-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d97706] shrink-0" />
          <span>
            Betala via din internetbank eller bankapp senast på förfallodagen för att undvika kostnadsränta hos Skatteverket.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#e7e2d7]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-800 text-xs font-semibold transition border border-[#e7e2d7] cursor-pointer"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
}
