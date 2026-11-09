'use client';

import React, { useState } from 'react';
import { Receipt } from '@/types/database';
import { formatSEK } from '@/lib/utils';
import { 
  Mail, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Settings,
  HelpCircle
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
    subject: 'Din kvitto/faktura från Slack Technologies #INV-88219',
    body: `Hej Johan!

Här kommer ditt kvitto för Slack Pro abonnemang (5 användare).

Fakturanummer: SLACK-SE-90812
Fakturadatum: 2026-04-18
Leverantör: Slack Technologies Limited, Dublin Ireland
VAT ID: SE502081923401

1x Slack Pro Månadsprenumeration: 420,00 SEK
Moms (25%): 105,00 SEK
Totalt debiterat Visa **** 4912: 525,00 SEK

Tack för att du använder Slack!`,
  },
  {
    sender: 'noreply@uber.com',
    subject: 'Din resa med Uber den 21 april 2026',
    body: `Tack för att du reser med Uber!

Datum: 2026-04-21 16:42
Förare: Taxibil Stockholm 15 00 00
Resväg: Centralstationen -> Hammarby Sjöstad (Kundmöte)

Resebelopp: 245,28 kr
Moms (6% inrikes persontransport): 14,72 kr
Totalt debiterat: 260,00 SEK

Kvitto utfärdat enligt svensk mervärdesskattelag.`,
  },
  {
    sender: 'faktura@bokio.se',
    subject: 'Kvitto: Bokio Premium abonnemang för bokföring',
    body: `Bokio AB (Org.nr: 556999-1234)
Fakturadatum: 2026-04-25
Period: April 2026

Specifikation:
Bokio Premium Bokföringstjänst: 299,00 SEK
Moms (25%): 74,75 SEK
Totalt: 373,75 SEK

Betalningssätt: Dras via Autogiro`,
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

      // Construct receipt for local dashboard state
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
          reasoning: 'Inkommit via Resend e-postvidarebefordran. Verifierad med svensk skattelogik.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Vidarebefordra Kvitton via E-post</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Resend Inbound Webhook
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Automatisera kvitton från inkorgen rakt in i din skattebuffert
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address Card */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <span className="text-xs text-zinc-400 block font-medium">Din personliga inkorg för kvitton:</span>
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80">
            <code className="text-emerald-400 font-mono text-sm font-semibold select-all">
              {inboundAddress}
            </code>
            <button
              onClick={copyAddress}
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Kopiera adress</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            💡 Tips: Skapa en automatisk vidarebefordringsregel i Gmail eller Outlook för avsändare som Uber, Adobe och SJ!
          </p>
        </div>

        {/* Interactive Webhook Simulator */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Testa att vidarebefordra ett e-postkvitto:</span>
            </h4>
            <span className="text-[10px] text-zinc-500">Simulerar Resend Webhook</span>
          </div>

          {/* Quick preset selector */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {SAMPLE_EMAILS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  selectedSample.sender === sample.sender
                    ? 'border-emerald-500 bg-emerald-950/20 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-[11px] line-clamp-1">{sample.sender.split('@')[1]}</div>
                <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{sample.subject}</div>
              </button>
            ))}
          </div>

          {/* Editor fields */}
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-zinc-500 block mb-0.5">Avsändare (From)</label>
              <input
                type="text"
                value={customSender}
                onChange={(e) => setCustomSender(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="text-zinc-500 block mb-0.5">Ämnesrad (Subject)</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="text-zinc-500 block mb-0.5">E-postinnehåll (Kvitto / Fakturatext)</label>
              <textarea
                rows={5}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition"
            >
              Stäng
            </button>
            <button
              type="button"
              onClick={handleSimulateWebhook}
              disabled={isSending}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-950"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Skickar & AI-tolkar...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Skicka test-epost till Klaro</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
