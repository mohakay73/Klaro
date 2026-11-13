'use client';

import React, { useState } from 'react';
import { Receipt } from '@/types/database';
import { formatSEK } from '@/lib/utils';
import { 
  Mail, 
  Copy, 
  Check, 
  Send, 
  X, 
  Loader2
} from 'lucide-react';

interface EmailForwardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptIngested: (receipt: Receipt) => void;
  userEmail?: string;
}

const SAMPLE_EMAILS = [
  {
    sender: 'billing@slack-corp.com',
    subject: 'Kvitto: Slack Technologies #INV-88219',
    body: `Hej Johan!

Här kommer ditt kvitto för Slack Pro abonnemang.

Fakturanummer: SLACK-SE-90812
Fakturadatum: 2026-04-18
Leverantör: Slack Technologies Limited, Dublin Ireland
VAT ID: SE502081923401

1x Slack Pro Månadsprenumeration: 420,00 SEK
Moms (25%): 105,00 SEK
Totalt debiterat: 525,00 SEK`,
  },
  {
    sender: 'noreply@uber.com',
    subject: 'Din resa med Uber den 21 april 2026',
    body: `Tack för att du reser med Uber!

Datum: 2026-04-21 16:42
Centralstationen -> Hammarby Sjöstad (Kundmöte)

Resebelopp: 245,28 kr
Moms (6% inrikes persontransport): 14,72 kr
Totalt debiterat: 260,00 SEK`,
  },
  {
    sender: 'faktura@bokio.se',
    subject: 'Kvitto: Bokio Premium abonnemang',
    body: `Bokio AB (Org.nr: 556999-1234)
Fakturadatum: 2026-04-25

Specifikation:
Bokio Premium: 299,00 SEK
Moms (25%): 74,75 SEK
Totalt: 373,75 SEK`,
  },
];

export function EmailForwardingModal({
  isOpen,
  onClose,
  onReceiptIngested,
  userEmail = 'johan@lindqvist.se',
}: EmailForwardingModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSample, setSelectedSample] = useState(SAMPLE_EMAILS[0]);
  const [customSubject, setCustomSubject] = useState(SAMPLE_EMAILS[0].subject);
  const [customBody, setCustomBody] = useState(SAMPLE_EMAILS[0].body);
  const [customSender, setCustomSender] = useState(SAMPLE_EMAILS[0].sender);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const inboundAddress = `kvitton+${userEmail.split('@')[0]}@klaro.se`;

  const copyAddress = () => {
    navigator.clipboard.writeText(inboundAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectSample = (sample: typeof SAMPLE_EMAILS[0]) => {
    setSelectedSample(sample);
    setCustomSender(sample.sender);
    setCustomSubject(sample.subject);
    setCustomBody(sample.body);
    setSuccessMsg(null);
  };

  const handleSimulateWebhook = async () => {
    setIsSending(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/webhooks/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: customSender,
          to: inboundAddress,
          subject: customSubject,
          text: customBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Webhook misslyckades.');

      const rateNum = parseInt(data.vat_bracket.replace(/[^0-9]/g, ''), 10) as any;
      const vatNum = rateNum > 0 
        ? Math.round((data.total_amount - data.total_amount / (1 + rateNum / 100)) * 100) / 100 
        : 0;

      const newReceipt: Receipt = {
        id: `rec-email-${Date.now()}`,
        user_id: '00000000-0000-0000-0000-000000000001',
        original_file_url: `email://${customSubject}`,
        source_type: 'email_forward',
        vendor_name: data.parsed_vendor || 'Slack / Leverantör',
        invoice_date: new Date().toISOString().split('T')[0],
        currency: 'SEK',
        total_amount: data.total_amount || 525,
        vat_amount: vatNum,
        vat_rate: rateNum || 25,
        category: rateNum === 6 ? 'Persontransport (Tåg, Taxi, Flyg)' : 'Programvaror & Molntjänster',
        raw_ai_response: {
          vendor_name: data.parsed_vendor,
          vat_rate: rateNum,
          vat_amount: vatNum,
          total_amount: data.total_amount,
          source_type: 'email_forward',
          reasoning: 'Inkommit via e-postvidarebefordran.',
        },
        status: 'parsed',
        created_at: new Date().toISOString(),
      };

      onReceiptIngested(newReceipt);
      setSuccessMsg(`Kvittot från ${data.parsed_vendor} (${formatSEK(data.total_amount)}) tolkades och lades till!`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <Mail className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">E-postvidarebefordran</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
                  Automatisk Inläsning
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Vidarebefordra e-postkvitton direkt till din personliga Klaro-adress
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Address Card */}
        <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-2">
          <span className="text-xs text-stone-600 block font-semibold">Din unika mottagaradress för kvitton:</span>
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-[#e7e2d7] shadow-2xs">
            <code className="text-[#1c1917] font-mono text-xs font-bold select-all">
              {inboundAddress}
            </code>
            <button
              onClick={copyAddress}
              className="px-3 py-1.5 rounded-lg bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition border border-[#e7e2d7] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>Kopierat</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kopiera</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            Skapa en automatisk vidarebefordringsregel i Gmail eller Outlook för leverantörer som Adobe, Uber och SJ.
          </p>
        </div>

        {/* Simulator */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1c1917]">
              Testa simulering av inkommande e-post:
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {SAMPLE_EMAILS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedSample.sender === sample.sender
                    ? 'border-[#1c1917] bg-[#1c1917] text-white shadow-xs font-semibold'
                    : 'border-[#e7e2d7] bg-[#f7f4ee] text-stone-600 hover:border-stone-400'
                }`}
              >
                <div className={`truncate font-semibold ${selectedSample.sender === sample.sender ? 'text-white' : 'text-[#1c1917]'}`}>
                  {sample.sender.split('@')[1]}
                </div>
                <div className={`text-[10px] line-clamp-1 mt-0.5 ${selectedSample.sender === sample.sender ? 'text-[#f59e0b]' : 'text-stone-500'}`}>
                  {sample.subject}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-2 text-xs">
            <div>
              <span className="text-[11px] text-stone-600 font-medium block mb-1">Avsändare</span>
              <input
                type="text"
                value={customSender}
                onChange={(e) => setCustomSender(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono text-xs focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div>
              <span className="text-[11px] text-stone-600 font-medium block mb-1">Ämne</span>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] text-xs focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div>
              <span className="text-[11px] text-stone-600 font-medium block mb-1">Meddelandeinnehåll</span>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                rows={4}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono text-xs focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#15803d] flex items-center gap-2 font-medium">
                <Check className="w-3.5 h-3.5 text-[#15803d]" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-[#e7e2d7]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-[#e7e2d7] hover:bg-[#f7f4ee] text-stone-700 text-xs font-medium transition cursor-pointer"
          >
            Stäng
          </button>
          <button
            onClick={handleSimulateWebhook}
            disabled={isSending}
            className="px-4 py-1.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f59e0b]" />
                <span>Skickar...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Simulera inkommande e-post</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
