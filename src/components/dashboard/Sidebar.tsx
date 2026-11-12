'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileCheck,
  Calculator,
  Landmark,
  Plus,
  Building2,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Inbox,
  Settings,
  X,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export type ActiveView = 'overview' | 'expenses' | 'invoices' | 'tax' | 'bank';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  companyType: 'enskild_firma' | 'aktiebolag';
  companyName: string;
  orgNr: string;
  onSwitchCompanyType?: (type: 'enskild_firma' | 'aktiebolag') => void;
  onOpenUpload: () => void;
  onOpenInvoiceBuilder: () => void;
  onOpenKivra: () => void;
  onOpenEmailForwarding: () => void;
  onOpenSettings: () => void;
  receiptsCount: number;
  invoicesCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  companyType,
  companyName,
  orgNr,
  onSwitchCompanyType,
  onOpenUpload,
  onOpenInvoiceBuilder,
  onOpenKivra,
  onOpenEmailForwarding,
  onOpenSettings,
  receiptsCount,
  invoicesCount,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [copiedBankgiro, setCopiedBankgiro] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const copyBankgiro = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('5050-1055');
    setCopiedBankgiro(true);
    setTimeout(() => setCopiedBankgiro(false), 2000);
  };

  const navItems: { id: ActiveView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Översikt', icon: LayoutDashboard },
    { id: 'expenses', label: 'Utgifter & Kvitton', icon: Receipt, badge: receiptsCount },
    { id: 'invoices', label: 'Kundfakturor', icon: FileCheck, badge: invoicesCount },
    { id: 'tax', label: 'Skatt & Deklaration', icon: Calculator },
    { id: 'bank', label: 'Bank & Avstämning', icon: Landmark },
  ];

  const handleNavClick = (view: ActiveView) => {
    onSelectView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-zinc-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Area: Logo & Company Switcher */}
        <div className="p-4 space-y-4">
          
          {/* Brand header + Mobile Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-extrabold text-sm shadow-xs tracking-tight">
                K
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-zinc-950 block leading-tight">
                  Klaro
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block">
                  Svensk Skattemotor
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              title="Stäng meny"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Company Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300 text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-900 truncate">
                    {companyName}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                    <span>{companyType === 'enskild_firma' ? 'Enskild Firma' : 'Aktiebolag'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">F-skatt</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-700 shrink-0 transition-transform duration-200 ${
                  isCompanyDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Popover Menu */}
            {isCompanyDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-3.5">
                <div className="space-y-1 pb-2 border-b border-zinc-100">
                  <div className="font-bold text-sm text-zinc-950 flex items-center justify-between">
                    <span className="truncate">{companyName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      Aktiv
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Org.nr: {orgNr}
                  </div>
                </div>

                {/* Company Type Switcher */}
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 block">
                    Växla bolagsform
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchCompanyType) onSwitchCompanyType('enskild_firma');
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left text-sm transition flex items-center justify-between ${
                        companyType === 'enskild_firma'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">Enskild Firma</div>
                        <div className="text-xs text-zinc-500 font-normal">Egenavgifter 28,97% + Skatt</div>
                      </div>
                      {companyType === 'enskild_firma' && (
                        <Check className="w-4 h-4 text-emerald-700" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchCompanyType) onSwitchCompanyType('aktiebolag');
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left text-sm transition flex items-center justify-between ${
                        companyType === 'aktiebolag'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">Aktiebolag (AB)</div>
                        <div className="text-xs text-zinc-500 font-normal">Bolagsskatt 20,6%</div>
                      </div>
                      {companyType === 'aktiebolag' && (
                        <Check className="w-4 h-4 text-emerald-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Skattekonto & F-skatt Details */}
                <div className="pt-2 border-t border-zinc-100 space-y-1 text-xs text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Skatteverkets Bg:</span>
                    <button
                      type="button"
                      onClick={copyBankgiro}
                      className="font-mono text-zinc-900 font-bold hover:text-emerald-700 inline-flex items-center gap-1.5"
                    >
                      5050-1055
                      {copiedBankgiro ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onOpenUpload();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Skanna kvitto / utgift</span>
          </button>

          {/* Main Navigation List */}
          <nav className="space-y-1 pt-2">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 px-3 block mb-1.5">
              Huvudmeny
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Integrations & Secondary Tools */}
          <div className="space-y-1 pt-4 border-t border-zinc-100">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 px-3 block mb-1.5">
              Verktyg & Inkorg
            </span>
            
            <button
              onClick={() => {
                onOpenKivra();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition"
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-zinc-500" />
                <span>Kivra Företag</span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aktiv
              </span>
            </button>

            <button
              onClick={() => {
                onOpenEmailForwarding();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span>Vidarebefordra e-post</span>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 transition"
            >
              <Settings className="w-4 h-4 text-zinc-500" />
              <span>Företagsinställningar</span>
            </button>
          </div>
        </div>

        {/* Bottom Area: Skattekonto & Security status */}
        <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="font-semibold text-zinc-800 text-xs">Skatteverket Synk</span>
            </div>
            <span className="text-xs font-mono font-medium text-zinc-500">Live</span>
          </div>
          <div className="text-xs text-zinc-500 leading-normal">
            Bankgiro 5050-1055 reserveras automatiskt för moms & F-skatt.
          </div>
        </div>
      </aside>
    </>
  );
}
