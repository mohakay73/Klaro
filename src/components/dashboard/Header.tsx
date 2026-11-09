'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  FileSpreadsheet, 
  Landmark,
  Settings,
  Mail,
  ChevronDown
} from 'lucide-react';
import { formatSEK } from '@/lib/utils';

export type QuarterPeriod = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ALL';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenInvoiceBuilder: () => void;
  onOpenPayMoms: () => void;
  onOpenDeclaration: () => void;
  onOpenSettings: () => void;
  onOpenKivra: () => void;
  onOpenEmailForwarding: () => void;
  selectedPeriod: QuarterPeriod;
  onSelectPeriod: (period: QuarterPeriod) => void;
  companyType: 'enskild_firma' | 'aktiebolag';
  companyName: string;
  orgNr: string;
  netMoms: number;
}

export function Header({
  onOpenUpload,
  onOpenInvoiceBuilder,
  onOpenPayMoms,
  onOpenDeclaration,
  onOpenSettings,
  onOpenKivra,
  onOpenEmailForwarding,
  selectedPeriod,
  onSelectPeriod,
  companyType,
  companyName,
  orgNr,
  netMoms,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const emailAddress = 'kvitton+demo@klaro.se';

  const copyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo, Company info & Period selector */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shadow-sm shadow-emerald-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-white tracking-tight">Klaro</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  SE Tax Relief
                </span>
                <button
                  onClick={onOpenSettings}
                  className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1 font-medium"
                  title="Klicka för att konfigurera bolagsuppgifter"
                >
                  <Building2 className="w-3 h-3" />
                  {companyType === 'enskild_firma' ? 'Enskild Firma' : 'Aktiebolag (AB)'}
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                {companyName} • Org.nr: {orgNr}
              </p>
            </div>

            {/* Quarter Period Switcher */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 text-xs font-mono ml-0 sm:ml-2">
              {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
                <button
                  key={q}
                  onClick={() => onSelectPeriod(q)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    selectedPeriod === q
                      ? 'bg-zinc-800 text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {q === 'ALL' ? 'Helår 2026' : q}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Pay Moms trigger button */}
            {netMoms > 0 && (
              <button
                onClick={onOpenPayMoms}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition"
                title="Generera Skatteverket OCR och Bankgirobetalning"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Betala Moms: {formatSEK(Math.round(netMoms))}</span>
              </button>
            )}

            {/* Kivra Företagsbrevlåda */}
            <button
              onClick={onOpenKivra}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium transition"
              title="Hämta fakturor från Kivra"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Kivra</span>
            </button>

            {/* Skatteverket SKV 4700 declaration view */}
            <button
              onClick={onOpenDeclaration}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition"
              title="Öppna Skatteverkets officiella blankettsammanställning"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Momsdeklaration</span>
            </button>

            {/* Inbound Email Forwarder Widget */}
            <div className="hidden xl:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-zinc-500">Vidarebefordra:</span>
              <code className="text-zinc-300 font-mono text-[11px]">{emailAddress}</code>
              <button
                onClick={copyEmail}
                className="ml-1 text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-800 rounded"
                title="Kopiera e-postadress för kvittoinlämning"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Create Invoice */}
            <button
              onClick={onOpenInvoiceBuilder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ny Faktura</span>
            </button>

            {/* AI Receipt Upload */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-sm shadow-emerald-950"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tolka Kvitto</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Inställningar och bolagsprofil"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
