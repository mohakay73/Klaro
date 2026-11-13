'use client';

import React from 'react';
import { 
  Menu, 
  Upload, 
  Plus, 
  Landmark, 
  Download, 
  FileText, 
  RefreshCw,
  Sparkles,
  User
} from 'lucide-react';
import { formatSEK } from '@/lib/utils';
import { ActiveView } from './Sidebar';

export type QuarterPeriod = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ALL';

interface HeaderProps {
  activeView: ActiveView;
  onOpenMobileMenu: () => void;
  selectedPeriod: QuarterPeriod;
  onSelectPeriod: (period: QuarterPeriod) => void;
  netMoms: number;
  onOpenUpload: () => void;
  onOpenInvoiceBuilder: () => void;
  onOpenPayMoms: () => void;
  onOpenDeclaration: () => void;
  onExportSIE?: () => void;
  onSyncBank?: () => void;
  onOpenDemoTour?: () => void;
  currentUser?: any;
  onOpenAuth?: () => void;
}

const VIEW_TITLES: Record<ActiveView, { title: string; subtitle: string }> = {
  overview: {
    title: 'Översikt',
    subtitle: 'Finansiellt cockpit och skattebuffert i realtid',
  },
  expenses: {
    title: 'Utgifter & Kvitton',
    subtitle: 'Verifierade verifikationer och automatisk momsberäkning',
  },
  invoices: {
    title: 'Kundfakturor',
    subtitle: 'Fakturerade intäkter och utgående moms',
  },
  tax: {
    title: 'Skatt & Deklaration',
    subtitle: 'Skatteverkets momsrutor, F-skatt och skattesimulator',
  },
  bank: {
    title: 'Bank & Avstämning',
    subtitle: 'Open Banking PSD2 koppling och automatisk avstämning',
  },
  landing: {
    title: 'Om Klaro',
    subtitle: 'Sveriges modernaste skattebuffert & bokföring',
  },
};

export function Header({
  activeView,
  onOpenMobileMenu,
  selectedPeriod,
  onSelectPeriod,
  netMoms,
  onOpenUpload,
  onOpenInvoiceBuilder,
  onOpenPayMoms,
  onOpenDeclaration,
  onExportSIE,
  onSyncBank,
  onOpenDemoTour,
  currentUser,
  onOpenAuth,
}: HeaderProps) {
  const currentViewMeta = VIEW_TITLES[activeView];

  return (
    <header className="border-b border-[#e7e2d7] bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 rounded-lg transition"
            title="Öppna navigering"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm text-stone-400 flex-wrap">
              <span className="font-semibold text-stone-500">Klaro</span>
              <span>/</span>
              <span className="font-bold text-[#1c1917] text-base">{currentViewMeta.title}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-[#b45309] border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                Live
              </span>
              {onOpenDemoTour && (
                <button
                  type="button"
                  onClick={onOpenDemoTour}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] hover:bg-[#eee9df] text-[#1c1917] border border-[#e7e2d7] transition cursor-pointer active:scale-95"
                  title="Starta interaktiv snabbdemo (60s)"
                >
                  <Sparkles className="w-3 h-3 text-[#d97706]" />
                  <span>Snabbdemo (60s)</span>
                </button>
              )}
            </div>
            <p className="hidden md:block text-xs text-stone-500 font-normal truncate max-w-sm mt-0.5">
              {currentViewMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Quarter Segmented Filter */}
        <div className="hidden sm:flex items-center rounded-lg border border-[#e7e2d7] bg-[#f7f4ee]/90 p-1 text-xs font-mono shadow-2xs">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
            <button
              key={q}
              onClick={() => onSelectPeriod(q)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                selectedPeriod === q
                  ? 'bg-white text-[#1c1917] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-[#1c1917]'
              }`}
            >
              {q === 'ALL' ? 'Helår' : q}
            </button>
          ))}
        </div>

        {/* Mobile Quarter Dropdown Pill */}
        <div className="sm:hidden flex items-center">
          <select
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(e.target.value as QuarterPeriod)}
            className="px-2.5 py-1.5 rounded-lg border border-[#e7e2d7] bg-[#f7f4ee] text-xs font-mono font-bold text-[#1c1917] shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#1c1917]"
          >
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
            <option value="ALL">Helår</option>
          </select>
        </div>

        {/* Right: Contextual Quick Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Action based on view */}
          {activeView === 'overview' && (
            <>
              {netMoms > 0 && (
                <button
                  onClick={onOpenPayMoms}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 shadow-2xs transition"
                >
                  <Landmark className="w-4 h-4 text-[#b45309]" />
                  <span>Betala moms ({formatSEK(Math.round(netMoms))})</span>
                </button>
              )}
              <button
                onClick={onOpenInvoiceBuilder}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-stone-800 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-[#e7e2d7] hover:border-stone-400 transition shadow-2xs"
              >
                <Plus className="w-4 h-4 text-stone-500" />
                <span>Fakturera</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95"
              >
                <Upload className="w-4 h-4 text-[#f59e0b]" />
                <span>Tolka<span className="hidden sm:inline"> kvitto</span></span>
              </button>
            </>
          )}

          {activeView === 'expenses' && (
            <>
              {onExportSIE && (
                <button
                  onClick={onExportSIE}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-[#e7e2d7] transition shadow-2xs active:scale-95"
                  title="Exportera verifikationer till SIE-4 format för Skatteverket/Bokföring"
                >
                  <Download className="w-4 h-4 text-stone-500" />
                  <span className="hidden sm:inline">Exportera</span> SIE-4
                </button>
              )}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95"
              >
                <Upload className="w-4 h-4 text-[#f59e0b]" />
                <span>Tolka<span className="hidden sm:inline"> nytt kvitto</span></span>
              </button>
            </>
          )}

          {activeView === 'invoices' && (
            <button
              onClick={onOpenInvoiceBuilder}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#f59e0b]" />
              <span>Ny<span className="hidden sm:inline"> kundfaktura</span></span>
            </button>
          )}

          {activeView === 'tax' && (
            <>
              <button
                onClick={onOpenDeclaration}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-[#e7e2d7] transition shadow-2xs active:scale-95"
              >
                <FileText className="w-4 h-4 text-stone-500" />
                <span className="hidden sm:inline">Skatteverket </span>XML
              </button>
              <button
                onClick={onOpenPayMoms}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95"
              >
                <Landmark className="w-4 h-4 text-[#f59e0b]" />
                <span>Betala moms</span>
              </button>
            </>
          )}

          {activeView === 'bank' && onSyncBank && (
            <button
              onClick={onSyncBank}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-[#f59e0b]" />
              <span>Synka<span className="hidden sm:inline"> transaktioner</span></span>
            </button>
          )}

          {/* User / Supabase Auth Button */}
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition border ${
                currentUser
                  ? 'bg-[#f7f4ee] hover:bg-[#eee9df] text-[#1c1917] border-[#e7e2d7]'
                  : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-[#1c1917] border-[#e7e2d7]'
              }`}
              title={currentUser ? `Inloggad som ${currentUser.email}` : 'Logga in eller skapa konto'}
            >
              <User className={`w-4 h-4 ${currentUser ? 'text-[#d97706]' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">
                {currentUser ? (currentUser.email?.split('@')[0] || 'Konto') : 'Logga in'}
              </span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
