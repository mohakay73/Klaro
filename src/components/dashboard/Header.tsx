'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Settings, 
  Upload, 
  Plus, 
  Mail, 
  Check, 
  Copy, 
  Landmark,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink
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
  onSwitchCompanyType?: (type: 'enskild_firma' | 'aktiebolag') => void;
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
  onSwitchCompanyType,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const emailAddress = 'kvitton+demo@klaro.se';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Left: Brand & Company Context Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-xs">
              K
            </div>
            <span className="font-extrabold text-sm tracking-tight text-zinc-950">Klaro</span>
          </div>

          <span className="text-zinc-300">/</span>

          {/* Company Selector Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition border border-zinc-200/70 bg-zinc-50/50 shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {companyName}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-medium">
                ({companyType === 'enskild_firma' ? 'EF' : 'AB'})
              </span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 group-hover:text-zinc-700 transition-transform duration-200 ${
                isCompanyDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Popover Dropdown */}
            {isCompanyDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg z-50 animate-in fade-in zoom-in-95 space-y-3">
                <div className="space-y-1 pb-2 border-b border-zinc-100">
                  <div className="font-bold text-xs text-zinc-950 flex items-center justify-between">
                    <span>{companyName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Aktiv
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Org.nr: {orgNr}
                  </div>
                </div>

                {/* Bolagsform Switcher */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                    Växla skatteregler
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchCompanyType) onSwitchCompanyType('enskild_firma');
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        companyType === 'enskild_firma'
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <div className="text-[11px]">Enskild Firma</div>
                      <div className="text-[10px] text-zinc-500 font-normal">F-skatt 43%</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchCompanyType) onSwitchCompanyType('aktiebolag');
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        companyType === 'aktiebolag'
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <div className="text-[11px]">Aktiebolag</div>
                      <div className="text-[10px] text-zinc-500 font-normal">Bolagsskatt 20.6%</div>
                    </button>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-100 text-[11px] text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span>F-skattsedel:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Godkänd
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bankgiro:</span>
                    <span className="font-mono text-zinc-800 font-semibold">5123-4567</span>
                  </div>
                </div>

                {/* Settings action */}
                <div className="pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      setIsCompanyDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition flex items-center justify-between"
                  >
                    <span>Redigera företagsprofil...</span>
                    <Settings className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Quarter Segmented Control */}
        <div className="hidden md:flex items-center rounded-lg border border-zinc-200 bg-zinc-100/90 p-0.5 text-xs font-mono shadow-2xs">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
            <button
              key={q}
              onClick={() => onSelectPeriod(q)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                selectedPeriod === q
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
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
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/90 text-[11px] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition shadow-2xs"
            title="Klicka för instruktioner för e-postvidarebefordran"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-mono font-medium text-zinc-800">{emailAddress}</span>
            <span
              onClick={copyEmail}
              className="ml-0.5 p-0.5 hover:text-zinc-950 transition"
              title="Kopiera adress"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            </span>
          </button>

          {/* Pay Moms button */}
          {netMoms > 0 && (
            <button
              onClick={onOpenPayMoms}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 shadow-2xs transition"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-700" />
              <span>Betala moms ({formatSEK(Math.round(netMoms))})</span>
            </button>
          )}

          {/* New Invoice */}
          <button
            onClick={onOpenInvoiceBuilder}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span>Fakturera</span>
          </button>

          {/* Primary Action: Tolka Kvitto */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tolka kvitto</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition"
            title="Inställningar"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
