'use client';

import React, { useState } from 'react';
import { generateSkatteverketOCR, SKATTEVERKET_BANKGIRO, SKATTEVERKET_RECEIVER } from '@/lib/skatteverket-ocr';
import { formatSEK } from '@/lib/utils';
import { X, Copy, Check, QrCode, ShieldCheck, AlertCircle, ArrowUpRight, CheckCircle2, Landmark } from 'lucide-react';

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
  const [isMarkedAsPaid, setIsMarkedAsPaid] = useState(false);

  if (!isOpen) return null;

  const ocrNumber = generateSkatteverketOCR(orgNr || '559123-4567');
  const amountToPay = Math.max(0, Math.round(netMoms));

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Betala Moms till Skatteverket</h3>
              <p className="text-xs text-zinc-400">Direkt Bankgiro & OCR för ditt skattekonto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount to pay hero card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-zinc-950 border border-amber-800/40 text-center space-y-1">
          <span className="text-xs uppercase font-medium tracking-wider text-amber-400">
            Netto moms att inbetala (Kvartal 2)
          </span>
          <div className="text-3xl font-extrabold font-mono text-white">
            {formatSEK(amountToPay)}
          </div>
          <div className="text-xs text-zinc-400 pt-1">
            Förfallodatum: <strong className="text-zinc-200">{dueDate}</strong>
          </div>
        </div>

        {/* Swedish Bankgiro & OCR Details Grid */}
        <div className="space-y-3 text-xs">
          
          {/* Mottagare */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500">Mottagare</span>
              <div className="font-medium text-zinc-200 mt-0.5">{SKATTEVERKET_RECEIVER}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              Officiellt skattekonto
            </span>
          </div>

          {/* Bankgiro */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500">Bankgironummer</span>
              <div className="font-mono font-bold text-sm text-zinc-100 mt-0.5">
                {SKATTEVERKET_BANKGIRO}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(SKATTEVERKET_BANKGIRO, 'bg')}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition font-medium text-[11px]"
            >
              {copiedField === 'bg' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopierat!</span>
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
          <div className="p-3 rounded-lg bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-emerald-400 font-semibold">Ditt unika OCR-nummer (Luhn-kontroll)</span>
              </div>
              <div className="font-mono font-extrabold text-base text-emerald-300 tracking-wider mt-0.5">
                {ocrNumber}
              </div>
              <span className="text-[10px] text-zinc-500">Genererat från Org.nr / Personnummer: {orgNr}</span>
            </div>
            <button
              onClick={() => copyToClipboard(ocrNumber, 'ocr')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1.5 transition font-bold text-[11px] shadow-sm shadow-emerald-950"
            >
              {copiedField === 'ocr' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopiera OCR</span>
                </>
              )}
            </button>
          </div>

          {/* Belopp */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500">Exakt belopp att betala (SEK)</span>
              <div className="font-mono font-bold text-sm text-zinc-100 mt-0.5">
                {amountToPay} kr
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(amountToPay.toString(), 'amount')}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition font-medium text-[11px]"
            >
              {copiedField === 'amount' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopierat!</span>
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

        {/* Bank app instructions */}
        <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
          <div className="font-semibold text-zinc-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Så betalar du i din internetbank / mobilapp:
          </div>
          <ol className="list-decimal list-inside space-y-0.5 pl-1 text-zinc-400">
            <li>Öppna din bank (Handelsbanken, Swedbank, SEB, Nordea, etc.).</li>
            <li>Välj <strong>Betala / Överföra</strong> och ange Bankgiro <strong>5050-1055</strong>.</li>
            <li>Klistra in ditt OCR-nummer ovan som referens.</li>
            <li>Godkänn med Mobilt BankID. Pengarna bokförs direkt på ditt skattekonto!</li>
          </ol>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            onClick={() => setIsMarkedAsPaid(!isMarkedAsPaid)}
            className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              isMarkedAsPaid
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isMarkedAsPaid ? 'Markerad som inbetald!' : 'Markera som inbetald'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            Klar
          </button>
        </div>

      </div>
    </div>
  );
}
