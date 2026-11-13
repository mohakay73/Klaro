'use client';

import React, { useState } from 'react';
import { Receipt } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { 
  Mail, 
  Check, 
  X, 
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';

interface KivraDocument {
  id: string;
  sender: string;
  subject: string;
  date: string;
  amount: number;
  vatRate: 25 | 12 | 6 | 0;
  category: string;
  basAccount: string;
  imported: boolean;
}

const MOCK_KIVRA_FEED: KivraDocument[] = [
  {
    id: 'kivra-1',
    sender: 'Telia Sverige AB',
    subject: 'Mobilabonnemang Företag (April 2026)',
    date: '2026-04-22',
    amount: 549.00,
    vatRate: 25,
    category: 'Telefoni & Internet',
    basAccount: '6210',
    imported: false,
  },
  {
    id: 'kivra-2',
    sender: 'Trygg-Hansa Försäkring',
    subject: 'Premiefaktura Företagsförsäkring Konsult',
    date: '2026-04-25',
    amount: 1450.00,
    vatRate: 0,
    category: 'Bankavgifter & Finansiella Tjänster',
    basAccount: '6570',
    imported: false,
  },
  {
    id: 'kivra-3',
    sender: 'Fortum Markets AB',
    subject: 'Elräkning Verksamhetslokal / Kontor',
    date: '2026-04-28',
    amount: 890.00,
    vatRate: 25,
    category: 'Kontorsmaterial & Lokalkostnad',
    basAccount: '5410',
    imported: false,
  },
];

interface KivraInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportReceipt: (receipt: Receipt) => void;
}

export function KivraInboxModal({
  isOpen,
  onClose,
  onImportReceipt,
}: KivraInboxModalProps) {
  const [documents, setDocuments] = useState<KivraDocument[]>(MOCK_KIVRA_FEED);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleImport = (doc: KivraDocument) => {
    const vat = doc.vatRate > 0 ? Math.round((doc.amount - doc.amount / (1 + doc.vatRate / 100)) * 100) / 100 : 0;

    const newReceipt: Receipt = {
      id: `rec-kivra-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      original_file_url: `kivra://${doc.sender}`,
      source_type: 'email_forward',
      vendor_name: doc.sender,
      invoice_date: doc.date,
      currency: 'SEK',
      total_amount: doc.amount,
      vat_amount: vat,
      vat_rate: doc.vatRate,
      category: doc.category,
      raw_ai_response: {
        vendor_name: doc.sender,
        invoice_date: doc.date,
        total_amount: doc.amount,
        vat_amount: vat,
        vat_rate: doc.vatRate,
        category: doc.category,
        bas_account: doc.basAccount,
        source: 'Kivra Digital Företagsbrevlåda',
        reasoning: `Automatisk inläsning från Kivra. Hanterad enligt BAS ${doc.basAccount}.`,
      },
      status: 'verified',
      created_at: new Date().toISOString(),
    };

    onImportReceipt(newReceipt);
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, imported: true } : d))
    );
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <Mail className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">Kivra Företagsbrevlåda</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
                  Digital Myndighetspost
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Importera fakturor från svenska leverantörer direkt utan manuell nedladdning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
              title="Hämta nya brev från Kivra"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#d97706]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d97706] shrink-0" />
            <span>Kopplad mot BankID-verifierat företagskonto</span>
          </div>
          <span className="font-mono text-[11px] text-stone-500 font-medium">3 nya fakturor</span>
        </div>

        {/* Kivra Feed List */}
        <div className="space-y-2.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                doc.imported
                  ? 'bg-[#f7f4ee]/40 border-[#e7e2d7] opacity-60'
                  : 'bg-[#f7f4ee] border-[#e7e2d7] hover:border-stone-400'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#1c1917]">{doc.sender}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-stone-700 border border-[#e7e2d7]">
                    BAS {doc.basAccount}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{doc.subject}</p>
                <div className="text-[11px] text-stone-500 font-mono">
                  Mottaget: {formatDate(doc.date)} • Momssats: {doc.vatRate}%
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-[#1c1917] tabular-nums">
                    {formatSEK(doc.amount)}
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono block tabular-nums">
                    Moms: {formatSEK(doc.vatRate > 0 ? doc.amount - doc.amount / (1 + doc.vatRate / 100) : 0)}
                  </span>
                </div>

                {doc.imported ? (
                  <span className="px-3 py-1.5 rounded-xl bg-white text-stone-600 border border-[#e7e2d7] text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#15803d]" />
                    <span>Inläst</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleImport(doc)}
                    className="px-3 py-1.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>Importera</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#e7e2d7]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-800 text-xs font-semibold transition border border-[#e7e2d7] cursor-pointer"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
}
