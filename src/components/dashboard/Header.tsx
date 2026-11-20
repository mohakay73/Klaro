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
  User,
  Settings
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
  onOpenSettings?: () => void;
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
  onOpenSettings,
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
            </div>
            <p className="hidden md:block text-xs text-stone-500 font-normal truncate max-w-sm mt-0.5">
              {currentViewMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Quarter Segmented Filter */}
        <div className="hidden md:flex items-center rounded-lg border border-[#e7e2d7] bg-[#f7f4ee]/90 p-1 text-xs font-mono shadow-2xs">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as QuarterPeriod[]).map((q) => (
            <button
              key={q}
              onClick={() => onSelectPeriod(q)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                selectedPeriod === q
                  ? 'bg-white text-[#1c1917] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-[#1c1917]'
              }`}
            >
              {q === 'ALL' ? 'Helår' : q}
            </button>
          ))}
        </div>

        {/* Mobile / Tablet Quarter Dropdown Pill */}
        <div className="md:hidden flex items-center">
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
        <div className="flex items-center gap-2">
          
          {/* Action based on view */}
          {activeView === 'overview' && (
            <>
              {netMoms > 0 && (
                <button
                  onClick={onOpenPayMoms}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-2xs transition cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>Betala moms ({formatSEK(Math.round(netMoms))})</span>
                </button>
              )}
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#d97706]" />
                <span>Tolka kvitto</span>
              </button>
            </>
          )}

          {activeView === 'expenses' && (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#d97706]" />
              <span>Tolka kvitto</span>
            </button>
          )}

          {activeView === 'invoices' && (
            <button
              onClick={onOpenInvoiceBuilder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d97706]" />
              <span>Ny kundfaktura</span>
            </button>
          )}

          {activeView === 'tax' && (
            <>
              <button
                onClick={onOpenDeclaration}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-[#e7e2d7] transition shadow-2xs active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-stone-500" />
                <span>Momsdeklaration</span>
              </button>
              {netMoms > 0 && (
                <button
                  onClick={onOpenPayMoms}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95 cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-[#d97706]" />
                  <span>Betala moms</span>
                </button>
              )}
            </>
          )}

          {activeView === 'bank' && onSyncBank && (
            <button
              onClick={onSyncBank}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#292524] transition shadow-xs active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#d97706]" />
              <span>Synka bankfeed</span>
            </button>
          )}

          {/* Settings Button (Always visible on all screens) */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#f7f4ee] text-stone-700 hover:text-[#1c1917] border border-[#e7e2d7] transition shadow-2xs cursor-pointer active:scale-95"
              title="Företagsprofil & Inställningar"
            >
              <Settings className="w-4 h-4 text-[#d97706]" />
              <span className="hidden sm:inline">Inställningar</span>
            </button>
          )}

          {/* User / Neon Auth Button */}
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                currentUser
                  ? 'bg-[#f7f4ee] hover:bg-[#eee9df] text-[#1c1917] border-[#e7e2d7]'
                  : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-[#1c1917] border-[#e7e2d7]'
              }`}
              title={currentUser ? `Inloggad som ${currentUser.email}` : 'Logga in eller skapa konto'}
            >
              <User className={`w-3.5 h-3.5 ${currentUser ? 'text-[#d97706]' : 'text-stone-400'}`} />
              <span className="font-semibold max-w-[110px] truncate">
                {currentUser ? (currentUser.email?.split('@')[0] || 'Konto') : 'Logga in'}
              </span>
              {currentUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Inloggad" />
              )}
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
