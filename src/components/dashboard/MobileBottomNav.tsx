'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  FileCheck, 
  Landmark, 
  Plus, 
  Upload, 
  FileText, 
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';
import { ActiveView } from './Sidebar';

interface MobileBottomNavProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  receiptsCount?: number;
  invoicesCount?: number;
  missingBankReceiptsCount?: number;
  onOpenUpload: () => void;
  onOpenInvoiceBuilder: () => void;
  onSyncBank?: () => void;
  onOpenDemoTour?: () => void;
}

export function MobileBottomNav({
  activeView,
  onSelectView,
  receiptsCount,
  invoicesCount,
  missingBankReceiptsCount,
  onOpenUpload,
  onOpenInvoiceBuilder,
  onSyncBank,
  onOpenDemoTour,
}: MobileBottomNavProps) {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const handleAction = (callback: () => void) => {
    setIsFabOpen(false);
    callback();
  };

  return (
    <>
      {/* Action Sheet Backdrop */}
      {isFabOpen && (
        <div 
          onClick={() => setIsFabOpen(false)}
          className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Floating Action Menu (Slide-up Bottom Sheet on FAB Click) */}
      {isFabOpen && (
        <div className="fixed inset-x-4 bottom-22 z-50 lg:hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-white rounded-2xl border border-[#e7e2d7] p-3 shadow-2xl space-y-1.5">
            <div className="px-3 py-2 flex items-center justify-between border-b border-[#e7e2d7]">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Snabbåtgärder</span>
              <button 
                onClick={() => setIsFabOpen(false)}
                className="w-6 h-6 rounded-full bg-[#f7f4ee] flex items-center justify-center text-stone-500 hover:text-[#1c1917]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => handleAction(onOpenUpload)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f4ee] text-left transition group active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1c1917]/5 border border-[#1c1917]/10 text-[#d97706] flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 text-[#d97706]" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#1c1917] group-hover:text-[#d97706] transition">Skanna kvitto / underlag</div>
                <div className="text-xs text-stone-500">Kamera eller bild med AI-tolkning & moms</div>
              </div>
            </button>

            <button
              onClick={() => handleAction(onOpenInvoiceBuilder)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f4ee] text-left transition group active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1c1917]/5 border border-[#1c1917]/10 text-[#1c1917] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#1c1917] group-hover:text-[#d97706] transition">Skapa svensk kundfaktura</div>
                <div className="text-xs text-stone-500">Moms, Bankgiro & OCR, godkänd PDF</div>
              </div>
            </button>

            {onSyncBank && (
              <button
                onClick={() => handleAction(onSyncBank)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f4ee] text-left transition group active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1c1917]/5 border border-[#1c1917]/10 text-[#1c1917] flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-stone-700" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1c1917] group-hover:text-[#d97706] transition">Synka banktransaktioner</div>
                  <div className="text-xs text-stone-500">Hämta nya händelser via PSD2</div>
                </div>
              </button>
            )}

            {onOpenDemoTour && (
              <button
                onClick={() => handleAction(onOpenDemoTour)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f4ee] text-left transition group active:scale-[0.98] border-t border-[#e7e2d7] mt-1"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1c1917] text-[#f59e0b] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1c1917] group-hover:text-[#d97706] transition">Interaktiv snabbdemo (60s)</div>
                  <div className="text-xs text-stone-500">Lär dig hur Klaro automatiserar skatt & fakturor</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Docked Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobil navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e7e2d7] lg:hidden shadow-[0_-4px_20px_rgba(28,25,23,0.04)] pb-[env(safe-area-inset-bottom,8px)]"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto">
          
          {/* Tab 1: Översikt */}
          <button
            onClick={() => onSelectView('overview')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${
              activeView === 'overview'
                ? 'text-[#1c1917] font-bold'
                : 'text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`w-5 h-5 ${activeView === 'overview' ? 'stroke-[2.5]' : ''}`} />
              {activeView === 'overview' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d97706]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Översikt</span>
          </button>

          {/* Tab 2: Utgifter */}
          <button
            onClick={() => onSelectView('expenses')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 relative ${
              activeView === 'expenses'
                ? 'text-[#1c1917] font-bold'
                : 'text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <div className="relative">
              <Receipt className={`w-5 h-5 ${activeView === 'expenses' ? 'stroke-[2.5]' : ''}`} />
              {receiptsCount !== undefined && receiptsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#f7f4ee] border border-[#e7e2d7] text-[#1c1917] text-[9px] font-mono font-bold px-1 rounded-full min-w-3.5 text-center">
                  {receiptsCount}
                </span>
              )}
              {activeView === 'expenses' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d97706]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Utgifter</span>
          </button>

          {/* Center: Tactile Espresso Floating Plus Button with Ochre Plus */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsFabOpen(!isFabOpen)}
              className={`w-12 h-12 -mt-5 rounded-2xl bg-[#1c1917] text-[#f59e0b] border border-[#e7e2d7]/50 flex items-center justify-center shadow-[0_8px_16px_rgba(28,25,23,0.35)] active:scale-90 transition-all duration-200 cursor-pointer ${
                isFabOpen ? 'rotate-45 bg-[#292524] text-white' : 'hover:scale-105 hover:bg-[#292524]'
              }`}
              title="Skapa ny händelse eller tolka kvitto"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 4: Fakturor */}
          <button
            onClick={() => onSelectView('invoices')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${
              activeView === 'invoices'
                ? 'text-[#1c1917] font-bold'
                : 'text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <div className="relative">
              <FileCheck className={`w-5 h-5 ${activeView === 'invoices' ? 'stroke-[2.5]' : ''}`} />
              {invoicesCount !== undefined && invoicesCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#f7f4ee] border border-[#e7e2d7] text-[#1c1917] text-[9px] font-mono font-bold px-1 rounded-full min-w-3.5 text-center">
                  {invoicesCount}
                </span>
              )}
              {activeView === 'invoices' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d97706]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Fakturor</span>
          </button>

          {/* Tab 5: Bank & Avstämning */}
          <button
            onClick={() => onSelectView('bank')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${
              activeView === 'bank'
                ? 'text-[#1c1917] font-bold'
                : 'text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <div className="relative">
              <Landmark className={`w-5 h-5 ${activeView === 'bank' ? 'stroke-[2.5]' : ''}`} />
              {missingBankReceiptsCount !== undefined && missingBankReceiptsCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#b45309] text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center animate-pulse">
                  {missingBankReceiptsCount}
                </span>
              )}
              {activeView === 'bank' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d97706]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Bank</span>
          </button>

        </div>
      </nav>
    </>
  );
}
