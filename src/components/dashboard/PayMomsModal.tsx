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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">Inbetalning till Skattekontot</h3>
              <p className="text-xs text-zinc-500">Skatteverkets Bankgiro och unikt OCR-referensnummer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount to pay hero card */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
          <span className="text-[11px] uppercase font-semibold tracking-wider text-zinc-500 block">
            Netto moms att inbetala
          </span>
          <div className="text-3xl font-extrabold font-mono text-zinc-950 tabular-nums">
            {formatSEK(amountToPay)}
          </div>
          <div className="text-xs text-zinc-500 pt-1 font-mono">
            Förfallodatum: <span className="text-zinc-900 font-bold">{dueDate}</span>
          </div>
        </div>

        {/* Bankgiro & OCR Details */}
        <div className="space-y-2.5 text-xs">
          
          {/* Mottagare */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500 block">Mottagare</span>
              <div className="font-semibold text-zinc-800 mt-0.5">{SKATTEVERKET_RECEIVER}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 text-zinc-700 border border-zinc-300">
              Skattekonto
            </span>
          </div>

          {/* Bankgiro */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500 block">Bankgironummer</span>
              <div className="font-mono font-bold text-sm text-zinc-950 mt-0.5">
                {SKATTEVERKET_BANKGIRO}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(SKATTEVERKET_BANKGIRO, 'bg')}
              className="px-2.5 py-1.5 rounded-md bg-white hover:bg-zinc-100 text-zinc-800 flex items-center gap-1.5 transition text-[11px] font-semibold border border-zinc-200 shadow-2xs"
            >
              {copiedField === 'bg' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kopierat</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Kopiera BG</span>
                </>
              )}
            </button>
          </div>

          {/* OCR-nummer */}
          <div className="p-3.5 rounded-lg bg-zinc-100/70 border border-zinc-300 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-600 font-semibold block">
                Ditt OCR-nummer (Luhn-kontroll)
              </span>
              <div className="font-mono font-black text-base text-zinc-950 tracking-wider mt-0.5 tabular-nums">
                {ocrNumber}
              </div>
              <span className="text-[10px] text-zinc-500">Kopplat till Org.nr {orgNr}</span>
            </div>
            <button
              onClick={() => copyToClipboard(ocrNumber, 'ocr')}
              className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 transition text-[11px] font-semibold shadow-xs"
            >
              {copiedField === 'ocr' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Kopiera OCR</span>
                </>
              )}
            </button>
          </div>

          {/* Belopp */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500 block">Exakt belopp (SEK)</span>
              <div className="font-mono font-bold text-sm text-zinc-950 mt-0.5 tabular-nums">
                {amountToPay} kr
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(amountToPay.toString(), 'amount')}
              className="px-2.5 py-1.5 rounded-md bg-white hover:bg-zinc-100 text-zinc-800 flex items-center gap-1.5 transition text-[11px] font-semibold border border-zinc-200 shadow-2xs"
            >
              {copiedField === 'amount' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kopierat</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Kopiera belopp</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Security / Verification note */}
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-600 shrink-0" />
          <span>
            Betala via din internetbank eller bankapp senast på förfallodagen för att undvika kostnadsränta hos Skatteverket.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition border border-zinc-200"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
}
