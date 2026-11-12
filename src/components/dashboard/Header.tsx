'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Settings, 
  Upload, 
  Plus, 
  Mail, 
  Check, 
  Copy, 
  Landmark,
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

  const copyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Left: Brand & Company Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-950 flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-xs">
              K
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900">Klaro</span>
          </div>

          <span className="text-zinc-300">/</span>

          {/* Company Selector Button */}
          <button
            onClick={onOpenSettings}
            className="group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition border border-transparent hover:border-zinc-200"
          >
            <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">
              {companyName}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ({companyType === 'enskild_firma' ? 'EF' : 'AB'})
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600" />
          </button>
        </div>

        {/* Center: Quarter Segmented Control */}
        <div className="hidden md:flex items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 text-xs font-mono">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
            <button
              key={q}
              onClick={() => onSelectPeriod(q)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                selectedPeriod === q
                  ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {q === 'ALL' ? 'Helår' : q}
            </button>
          ))}
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2">
          
          {/* Inbound Email Pill */}
          <button
            onClick={onOpenEmailForwarding}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition shadow-2xs"
            title="Klicka för instruktioner för e-postvidarebefordran"
          >
            <Mail className="w-3 h-3 text-zinc-400" />
            <span className="font-mono text-zinc-700">{emailAddress}</span>
            <span
              onClick={copyEmail}
              className="ml-0.5 p-0.5 hover:text-zinc-900 transition"
              title="Kopiera adress"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            </span>
          </button>

          {/* Pay Moms button */}
          {netMoms > 0 && (
            <button
              onClick={onOpenPayMoms}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-700" />
              <span>Betala moms ({formatSEK(Math.round(netMoms))})</span>
            </button>
          )}

          {/* New Invoice */}
          <button
            onClick={onOpenInvoiceBuilder}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition shadow-2xs"
          >
            <Plus className="w-3 h-3 text-zinc-500" />
            <span>Fakturera</span>
          </button>

          {/* Primary Action: Tolka Kvitto */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tolka kvitto</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
            title="Inställningar"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
