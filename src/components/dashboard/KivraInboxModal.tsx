'use client';

import React, { useState, useMemo } from 'react';
import { Receipt } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { 
  Inbox, 
  Check, 
  X, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileText,
  Mail
} from 'lucide-react';

export interface KivraDocument {
  id: string;
  sender: string;
  subject: string;
  date: string;
  amount: number;
  vatRate: 25 | 12 | 6 | 0;
  category: string;
  basAccount: string;
  orgNr?: string;
  pdfFilename?: string;
}

const DEFAULT_KIVRA_DOCUMENTS: KivraDocument[] = [
  {
    id: 'kivra-telia-01',
    sender: 'Telia Sverige AB',
    subject: 'Mobilabonnemang Företag (Fast pris & 5G)',
    date: '2026-11-18',
    amount: 549.00,
    vatRate: 25,
    category: 'Telefoni & Internet',
    basAccount: '6210',
    orgNr: '556430-0142',
    pdfFilename: 'telia_faktura_nov2026.pdf',
  },
  {
    id: 'kivra-fortum-02',
    sender: 'Fortum Markets AB',
    subject: 'Elräkning Verksamhetslokal / Arbetsrum',
    date: '2026-11-15',
    amount: 890.00,
    vatRate: 25,
    category: 'Kontorsmaterial & Lokalkostnad',
    basAccount: '5410',
    orgNr: '556597-2463',
    pdfFilename: 'fortum_elrakning_nov2026.pdf',
  },
  {
    id: 'kivra-trygghansa-03',
    sender: 'Trygg-Hansa Försäkring',
    subject: 'Premiefaktura Företagsförsäkring Konsult & Ansvarsförsäkring',
    date: '2026-11-10',
    amount: 1450.00,
    vatRate: 0,
    category: 'Bankavgifter & Finansiella Tjänster',
    basAccount: '6570',
    orgNr: '516401-7799',
    pdfFilename: 'trygg_hansa_premie_2026.pdf',
  },
  {
    id: 'kivra-skatteverket-04',
    sender: 'Skatteverket',
    subject: 'Beslut om Preliminärskatt & Debiterad F-skatt',
    date: '2026-11-05',
    amount: 3200.00,
    vatRate: 0,
    category: 'F-skatt & Skattekonto',
    basAccount: '2518',
    orgNr: '202100-5448',
    pdfFilename: 'skatteverket_beslut_fskatt.pdf',
  },
];

interface KivraInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportReceipt: (receipt: Receipt) => void;
  userId?: string;
  existingReceipts?: Receipt[];
}

export function KivraInboxModal({
  isOpen,
  onClose,
  onImportReceipt,
  userId = '00000000-0000-0000-0000-000000000001',
  existingReceipts = [],
}: KivraInboxModalProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'guide'>('inbox');
  const [importingId, setImportingId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [justImportedIds, setJustImportedIds] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const inboundEmailAddress = 'kvitto@nexougwen.resend.app';

  // Check if a document is already imported in the user's database
  const isDocumentImported = useMemo(() => {
    const importedMap: Record<string, boolean> = {};
    for (const doc of DEFAULT_KIVRA_DOCUMENTS) {
      const found = existingReceipts.some(
        (r) =>
          r.vendor_name.toLowerCase().includes(doc.sender.toLowerCase().split(' ')[0]) ||
          (r.original_file_url && r.original_file_url.includes(doc.id)) ||
          justImportedIds.includes(doc.id)
      );
      importedMap[doc.id] = found;
    }
    return importedMap;
  }, [existingReceipts, justImportedIds]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(inboundEmailAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleImportToDatabase = async (doc: KivraDocument) => {
    setImportingId(doc.id);
    setFeedbackMsg(null);

    try {
      const vat = doc.vatRate > 0 
        ? Math.round((doc.amount - doc.amount / (1 + doc.vatRate / 100)) * 100) / 100 
        : 0;

      const payload = {
        user_id: userId,
        vendor_name: doc.sender,
        invoice_date: doc.date,
        total_amount: doc.amount,
        vat_amount: vat,
        vat_rate: doc.vatRate,
        category: doc.category,
        bas_account: doc.basAccount,
        currency: 'SEK',
        source_type: 'email_forward',
        original_file_url: `kivra://${doc.id}`,
        status: 'verified',
        raw_ai_response: {
          vendor_name: doc.sender,
          vendor_org_nr: doc.orgNr,
          invoice_date: doc.date,
          total_amount: doc.amount,
          vat_amount: vat,
          vat_rate: doc.vatRate,
          category: doc.category,
          bas_account: doc.basAccount,
          source: 'Kivra Digital Företagsbrevlåda',
          reasoning: `Automatisk inläsning från Kivra Digital Företagsbrevlåda (${doc.subject}). Verifierad med ${doc.vatRate}% moms och BAS-konto ${doc.basAccount}.`,
        },
      };

      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Misslyckades med att spara i Neon.');
      }

      const savedReceipt: Receipt = data.receipt || {
        ...payload,
        id: `rec-kivra-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      onImportReceipt(savedReceipt);
      setJustImportedIds((prev) => [...prev, doc.id]);
      setFeedbackMsg(`Faktura från ${doc.sender} (${formatSEK(doc.amount)}) har bokförts och sparats i databasen!`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg(`Fel: ${err.message || 'Kunde inte importera handlingen.'}`);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5cc971] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">Kivra Digital Företagsbrevlåda</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#5cc971]/15 text-[#1b7030] font-bold border border-[#5cc971]/30">
                  Digital Myndighetspost
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Automatisk inläsning av fakturor från svenska leverantörer och myndigheter
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

        {/* Tab switcher */}
        <div className="flex border-b border-[#e7e2d7] text-xs">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-2.5 px-4 font-semibold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'inbox'
                ? 'border-[#1c1917] text-[#1c1917]'
                : 'border-transparent text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-[#5cc971]" />
            <span>Digitala fakturor & brev</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-4 font-semibold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#1c1917] text-[#1c1917]'
                : 'border-transparent text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Så kopplar du din riktiga Kivra</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* TAB 1: INBOX FEED */}
        {activeTab === 'inbox' ? (
          <div className="space-y-4">
            
            {/* Status alert */}
            <div className="p-3.5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5cc971] shrink-0" />
                <span>
                  Handlingar tolkas med <strong>BAS-kontoplan</strong> och sparas direkt i ditt 7-åriga lagstadgade arkiv.
                </span>
              </div>
            </div>

            {/* Document list */}
            <div className="space-y-3">
              {DEFAULT_KIVRA_DOCUMENTS.map((doc) => {
                const isImported = isDocumentImported[doc.id];
                const isCurrentImporting = importingId === doc.id;
                const vatAmount = doc.vatRate > 0 ? doc.amount - doc.amount / (1 + doc.vatRate / 100) : 0;

                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                      isImported
                        ? 'bg-[#f7f4ee]/40 border-[#e7e2d7] opacity-75'
                        : 'bg-[#f7f4ee] border-[#e7e2d7] hover:border-stone-400'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1c1917]">{doc.sender}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-stone-700 border border-[#e7e2d7] font-semibold">
                          BAS {doc.basAccount}
                        </span>
                        {doc.orgNr && (
                          <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
                            Org.nr: {doc.orgNr}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600">{doc.subject}</p>
                      <div className="text-[11px] text-stone-500 font-mono">
                        Datum: {formatDate(doc.date)} • Momssats: {doc.vatRate}% ({doc.category})
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e7e2d7]">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-[#1c1917] tabular-nums">
                          {formatSEK(doc.amount)}
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono block tabular-nums">
                          Moms: {formatSEK(vatAmount)}
                        </span>
                      </div>

                      {isImported ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bokförd i Neon</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleImportToDatabase(doc)}
                          disabled={isCurrentImporting}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                        >
                          {isCurrentImporting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f59e0b]" />
                              <span>Sparar...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
                              <span>Bokför & Spara</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TAB 2: HOW TO CONNECT YOUR REAL KIVRA */
          <div className="space-y-5 animate-in fade-in">
            
            {/* Direct Address Hero */}
            <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Din unika inläsningsadress för Kivra & E-post
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-[#e7e2d7]">
                <code className="text-xs font-mono font-bold text-[#1c1917] select-all truncate">
                  {inboundEmailAddress}
                </code>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1 rounded-md bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>Kopierat!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-300" />
                      <span>Kopiera</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                Alla fakturor som skickas till denna adress tolkas automatiskt av Klaros AI och arkiveras.
              </p>
            </div>

            {/* 3 Step Instruction Guide */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#1c1917] uppercase tracking-wider block">
                Så här gör du i 3 enkla steg:
              </span>

              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1c1917] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#1c1917]">Öppna Kivra</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Logga in i Kivra-appen på mobilen eller via BankID på <a href="https://kivra.se" target="_blank" rel="noreferrer" className="text-[#d97706] underline font-medium inline-flex items-center gap-0.5">kivra.se <ExternalLink className="w-3 h-3" /></a>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1c1917] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#1c1917]">Slå på automatisk vidarebefordran</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Gå till <strong>Inställningar</strong> ➔ <strong>Aviseringar & E-post</strong>. Klistra in din Klaro-adress ovan under vidarebefordran, alternativt sätt en automatisk vidarebefordringsregel i Gmail/Outlook för avsändaren <code className="bg-[#f7f4ee] px-1 py-0.5 rounded text-[11px]">no-reply@kivra.com</code>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#5cc971] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#1c1917]">Helt automatiserad bokföring</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Klart! Varje gång Telia, elbolaget, försäkringsbolaget eller Skatteverket skickar en faktura till din Kivra, plockas PDF:en upp av Klaros AI, tolkas automatiskt och sparas enligt Bokföringslagen (7 år).
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#e7e2d7]">
          <span className="text-[11px] text-stone-500">
            Klaro Företagsarkiv • Bokföringslagen 7 kap. 2 §
          </span>
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
