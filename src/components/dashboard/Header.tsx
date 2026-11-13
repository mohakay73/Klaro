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
  Sparkles
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
}: HeaderProps) {
  const currentViewMeta = VIEW_TITLES[activeView];

  return (
    <header className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
            title="Öppna navigering"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
              <span className="font-semibold text-zinc-500">Klaro</span>
              <span>/</span>
              <span className="font-bold text-zinc-950 text-base">{currentViewMeta.title}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live
              </span>
              {onOpenDemoTour && (
                <button
                  type="button"
                  onClick={onOpenDemoTour}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0c3123]/5 hover:bg-[#0c3123]/10 text-[#0c3123] border border-[#0c3123]/15 transition cursor-pointer active:scale-95"
                  title="Starta interaktiv snabbdemo (60s)"
                >
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Snabbdemo (60s)</span>
                </button>
              )}
            </div>
            <p className="hidden md:block text-xs text-zinc-500 font-normal truncate max-w-sm mt-0.5">
              {currentViewMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Quarter Segmented Filter (Responsive: Desktop pills, Mobile select) */}
        <div className="hidden sm:flex items-center rounded-lg border border-zinc-200 bg-zinc-100/90 p-1 text-xs font-mono shadow-2xs">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
            <button
              key={q}
              onClick={() => onSelectPeriod(q)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                selectedPeriod === q
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
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
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-mono font-bold text-zinc-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0c3123]"
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
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 shadow-2xs transition"
                >
                  <Landmark className="w-4 h-4 text-amber-700" />
                  <span>Betala moms ({formatSEK(Math.round(netMoms))})</span>
                </button>
              )}
              <button
                onClick={onOpenInvoiceBuilder}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-800 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition shadow-2xs"
              >
                <Plus className="w-4 h-4 text-zinc-500" />
                <span>Fakturera</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Tolka<span className="hidden sm:inline"> kvitto</span></span>
              </button>
            </>
          )}

          {activeView === 'expenses' && (
            <>
              {onExportSIE && (
                <button
                  onClick={onExportSIE}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 transition shadow-2xs active:scale-95"
                  title="Exportera verifikationer till SIE-4 format för Skatteverket/Bokföring"
                >
                  <Download className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">Exportera</span> SIE-4
                </button>
              )}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Tolka<span className="hidden sm:inline"> nytt kvitto</span></span>
              </button>
            </>
          )}

          {activeView === 'invoices' && (
            <button
              onClick={onOpenInvoiceBuilder}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ny<span className="hidden sm:inline"> kundfaktura</span></span>
            </button>
          )}

          {activeView === 'tax' && (
            <>
              <button
                onClick={onOpenDeclaration}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 transition shadow-2xs active:scale-95"
              >
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">Skatteverket </span>XML
              </button>
              <button
                onClick={onOpenPayMoms}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs active:scale-95"
              >
                <Landmark className="w-4 h-4" />
                <span>Betala moms</span>
              </button>
            </>
          )}

          {activeView === 'bank' && onSyncBank && (
            <button
              onClick={onSyncBank}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Synka<span className="hidden sm:inline"> transaktioner</span></span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
