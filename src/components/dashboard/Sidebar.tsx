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
  missingBankReceiptsCount?: number;
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
  missingBankReceiptsCount,
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

  const navItems: { id: ActiveView; label: string; icon: React.ElementType; badge?: number; isAlert?: boolean }[] = [
    { id: 'overview', label: 'Översikt', icon: LayoutDashboard },
    { id: 'expenses', label: 'Utgifter & Kvitton', icon: Receipt, badge: receiptsCount },
    { id: 'invoices', label: 'Kundfakturor', icon: FileCheck, badge: invoicesCount },
    { id: 'tax', label: 'Skatt & Deklaration', icon: Calculator },
    { 
      id: 'bank', 
      label: 'Bank & Avstämning', 
      icon: Landmark, 
      badge: missingBankReceiptsCount && missingBankReceiptsCount > 0 ? missingBankReceiptsCount : undefined,
      isAlert: Boolean(missingBankReceiptsCount && missingBankReceiptsCount > 0)
    },
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-zinc-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Area: Logo & Company Switcher */}
        <div className="p-4 space-y-4">
          
          {/* Brand header + Mobile Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#0d3829] flex items-center justify-center text-white font-extrabold text-sm shadow-xs tracking-tight">
                K
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-zinc-950 block leading-tight">
                  Klaro
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

          {/* Company Switcher Pill (Mockup Style with initial avatar and F-skatt badge) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300 text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-800 font-bold text-xs shrink-0 shadow-2xs">
                  M
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-900 truncate">
                    {companyName}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                      <Check className="w-2.5 h-2.5 text-emerald-700" />
                      F-skatt
                    </span>
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

          {/* Primary Action Button (Deep Swedish Pine) */}
          <button
            onClick={() => {
              onOpenUpload();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#0d3829] hover:bg-[#07241a] text-white font-bold text-sm transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Skanna kvitto</span>
          </button>

          {/* Main Navigation List */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#f2efe9] text-zinc-950 font-bold border border-zinc-200/80 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        item.isAlert
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isActive
                            ? 'bg-zinc-200/80 text-zinc-800'
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
        </div>

        {/* Bottom Area: Docked Kivra Digital Post Card (Mockup Style) + Settings */}
        <div className="p-4 space-y-3 border-t border-zinc-200/80 bg-zinc-50/40">
          
          {/* Kivra Digital Post Docked Card */}
          <button
            onClick={() => {
              onOpenKivra();
              onCloseMobile();
            }}
            className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50/90 flex items-center gap-3 transition shadow-xs text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#5cc971] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Inbox className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-zinc-900 leading-tight">
                Kivra
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                digital post
              </div>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Kopplad" />
          </button>

          {/* Quick Settings Link */}
          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <button
              onClick={() => {
                onOpenEmailForwarding();
                onCloseMobile();
              }}
              className="hover:text-zinc-900 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>E-post</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onOpenSettings();
                onCloseMobile();
              }}
              className="hover:text-zinc-900 transition flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>Inställningar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
