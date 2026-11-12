'use client';

import React from 'react';
import { 
  Menu, 
  Upload, 
  Plus, 
  Landmark, 
  Download,
  FileText,
  RefreshCw
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
}: HeaderProps) {
  const currentViewMeta = VIEW_TITLES[activeView];

  return (
    <header className="border-b border-zinc-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 -ml-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
            title="Öppna navigering"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-600">Klaro</span>
              <span>/</span>
              <span className="font-bold text-zinc-950">{currentViewMeta.title}</span>
            </div>
            <p className="hidden md:block text-[11px] text-zinc-500 font-normal truncate max-w-xs">
              {currentViewMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Quarter Segmented Filter */}
        <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100/90 p-0.5 text-xs font-mono shadow-2xs">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
            <button
              key={q}
              onClick={() => onSelectPeriod(q)}
              className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-medium transition ${
                selectedPeriod === q
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {q === 'ALL' ? 'Helår' : q}
            </button>
          ))}
        </div>

        {/* Right: Contextual Quick Actions */}
        <div className="flex items-center gap-2">
          
          {/* Action based on view */}
          {activeView === 'overview' && (
            <>
              {netMoms > 0 && (
                <button
                  onClick={onOpenPayMoms}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 shadow-2xs transition"
                >
                  <Landmark className="w-3.5 h-3.5 text-amber-700" />
                  <span>Betala moms ({formatSEK(Math.round(netMoms))})</span>
                </button>
              )}
              <button
                onClick={onOpenInvoiceBuilder}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
                <span>Fakturera</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tolka kvitto</span>
              </button>
            </>
          )}

          {activeView === 'expenses' && (
            <>
              {onExportSIE && (
                <button
                  onClick={onExportSIE}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 transition shadow-2xs"
                  title="Exportera verifikationer till SIE-4 format för Skatteverket/Bokföring"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">Exportera</span> SIE-4
                </button>
              )}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tolka nytt kvitto</span>
              </button>
            </>
          )}

          {activeView === 'invoices' && (
            <button
              onClick={onOpenInvoiceBuilder}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Skapa kundfaktura</span>
            </button>
          )}

          {activeView === 'tax' && (
            <>
              <button
                onClick={onOpenDeclaration}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 transition shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>Skatteverket XML</span>
              </button>
              <button
                onClick={onOpenPayMoms}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Betala moms</span>
              </button>
            </>
          )}

          {activeView === 'bank' && onSyncBank && (
            <button
              onClick={onSyncBank}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Synka transaktioner</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
