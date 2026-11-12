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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900">Kivra Företagsbrevlåda</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Digital Myndighetspost
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Importera fakturor från svenska leverantörer direkt utan manuell nedladdning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
              title="Hämta nya brev från Kivra"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-zinc-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-600 shrink-0" />
            <span>Kopplad mot BankID-verifierat företagskonto</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500 font-medium">3 nya fakturor</span>
        </div>

        {/* Kivra Feed List */}
        <div className="space-y-2.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                doc.imported
                  ? 'bg-zinc-50/50 border-zinc-200 opacity-60'
                  : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-900">{doc.sender}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-zinc-700 border border-zinc-200">
                    BAS {doc.basAccount}
                  </span>
                </div>
                <p className="text-xs text-zinc-600">{doc.subject}</p>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Mottaget: {formatDate(doc.date)} • Momssats: {doc.vatRate}%
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-zinc-950 tabular-nums">
                    {formatSEK(doc.amount)}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block tabular-nums">
                    Moms: {formatSEK(doc.vatRate > 0 ? doc.amount - doc.amount / (1 + doc.vatRate / 100) : 0)}
                  </span>
                </div>

                {doc.imported ? (
                  <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Inläst</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleImport(doc)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Importera</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition border border-zinc-200"
          >
            Stäng
          </button>
        </div>

      </div>
    </div>
  );
}
