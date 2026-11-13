'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X
} from 'lucide-react';

export interface BusinessConfig {
  companyType: 'enskild_firma' | 'aktiebolag';
  companyName: string;
  orgNr: string;
  hasFSkatt: boolean;
  vatPeriod: 'quarterly' | 'monthly' | 'yearly';
  estimatedYearlyRevenue: number;
  municipalTaxRate: number;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: BusinessConfig;
  onComplete: (config: BusinessConfig) => void;
}

export function OnboardingWizard({
  isOpen,
  onClose,
  initialConfig,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BusinessConfig>(initialConfig);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(config);
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#f7f4ee] text-[#1c1917] font-mono text-xs font-bold flex items-center justify-center border border-[#e7e2d7]">
                {step}
              </span>
              <span className="text-xs font-mono font-medium text-stone-500">
                Steg {step} av 4 • Företagsinställningar
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-1.5 w-full bg-[#f7f4ee] rounded-full overflow-hidden border border-[#e7e2d7]">
            <div
              className="h-full bg-[#1c1917] transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Bolagsform */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-[#1c1917]">Vilken bolagsform driver du?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Klaro anpassar beräkningen för egenavgifter, schablonavdrag och skattereserver.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Enskild Firma */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, companyType: 'enskild_firma' })}
                className={`p-4 rounded-xl border text-left transition space-y-2 cursor-pointer ${
                  config.companyType === 'enskild_firma'
                    ? 'border-[#1c1917] bg-[#f7f4ee] ring-1 ring-[#1c1917] shadow-xs'
                    : 'border-[#e7e2d7] bg-white hover:border-stone-400 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1c1917]">Enskild Firma</span>
                  {config.companyType === 'enskild_firma' && (
                    <Check className="w-4 h-4 text-[#d97706]" />
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  För frilansare & konsulter med F-skatt. Beskattas med egenavgifter (28,97%) & kommunalskatt.
                </p>
              </button>

              {/* Aktiebolag */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, companyType: 'aktiebolag' })}
                className={`p-4 rounded-xl border text-left transition space-y-2 cursor-pointer ${
                  config.companyType === 'aktiebolag'
                    ? 'border-[#1c1917] bg-[#f7f4ee] ring-1 ring-[#1c1917] shadow-xs'
                    : 'border-[#e7e2d7] bg-white hover:border-stone-400 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1c1917]">Aktiebolag (AB)</span>
                  {config.companyType === 'aktiebolag' && (
                    <Check className="w-4 h-4 text-[#d97706]" />
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Juridisk person med fast bolagsskatt (20,6%). Lön och utdelning hanteras separat.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Företagsuppgifter & F-skatt */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div>
              <h3 className="text-base font-bold text-[#1c1917]">Dina företagsuppgifter</h3>
              <p className="text-stone-500 mt-1">
                Används för fakturering och OCR-generering för inbetalningar.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Företagsnamn</label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  placeholder="Lindqvist Digital Design"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-semibold focus:outline-none focus:border-[#1c1917]"
                />
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">
                  Organisationsnummer eller Personnummer (10 siffror)
                </label>
                <input
                  type="text"
                  value={config.orgNr}
                  onChange={(e) => setConfig({ ...config, orgNr: e.target.value })}
                  placeholder="559123-4567 eller ÅÅMMDD-XXXX"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1c1917]">Godkänd för F-skatt</span>
                  <p className="text-[11px] text-stone-500">Måste framgå på alla fakturor till svenska kunder</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.hasFSkatt}
                  onChange={(e) => setConfig({ ...config, hasFSkatt: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#1c1917] bg-white border-[#e7e2d7] accent-[#1c1917]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Momsdeklarationsperiod */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-[#1c1917]">Hur ofta redovisar du moms?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Klaro ställer in dina deklarationsdatum och momsdeadlines.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              {[
                {
                  id: 'quarterly',
                  title: 'Kvartalsvis (Vanligast för frilansare)',
                  desc: 'Deklareras 4 ggr/år (12 maj, 17 aug, 12 nov, 26 feb).',
                },
                {
                  id: 'monthly',
                  title: 'Månadsvis',
                  desc: 'Deklareras varje månad den 12:e.',
                },
                {
                  id: 'yearly',
                  title: 'Årsvis (Helår)',
                  desc: 'Deklareras en gång per år i samband med inkomstdeklarationen.',
                },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setConfig({ ...config, vatPeriod: p.id as any })}
                  className={`w-full p-3.5 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                    config.vatPeriod === p.id
                      ? 'border-[#1c1917] bg-[#f7f4ee] ring-1 ring-[#1c1917] shadow-xs'
                      : 'border-[#e7e2d7] bg-white hover:border-stone-400 shadow-2xs'
                  }`}
                >
                  <div>
                    <span className="font-bold text-[#1c1917] block">{p.title}</span>
                    <span className="text-[11px] text-stone-500 mt-0.5 block">{p.desc}</span>
                  </div>
                  {config.vatPeriod === p.id && (
                    <Check className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Uppskattad omsättning & Kommunalskatt */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div>
              <h3 className="text-base font-bold text-[#1c1917]">Omsättning & Skattesats</h3>
              <p className="text-stone-500 mt-1">
                Klaro använder dessa uppgifter för att beräkna din preliminärskatt och F-skattreserv.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">
                  Uppskattad årsomsättning (SEK exkl. moms)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={config.estimatedYearlyRevenue}
                  onChange={(e) => setConfig({ ...config, estimatedYearlyRevenue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono font-bold text-sm focus:outline-none focus:border-[#1c1917] tabular-nums"
                />
                <span className="text-[11px] text-stone-500 mt-1 block font-mono">
                  Ca {(config.estimatedYearlyRevenue / 12).toFixed(0)} kr / månad
                </span>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">
                  Kommunalskattesats (Snitt i Sverige ca 32%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.29"
                    max="0.35"
                    step="0.005"
                    value={config.municipalTaxRate}
                    onChange={(e) => setConfig({ ...config, municipalTaxRate: Number(e.target.value) })}
                    className="flex-1 accent-[#1c1917]"
                  />
                  <span className="font-mono font-bold text-sm text-[#1c1917] w-16 text-right tabular-nums">
                    {(config.municipalTaxRate * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Stockholm: 29.8% • Göteborg: 32.6% • Malmö: 32.4%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e7e2d7]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-1.5 rounded-xl border border-[#e7e2d7] hover:bg-[#f7f4ee] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tillbaka</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <span>{step === 4 ? 'Spara inställningar' : 'Nästa'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#f59e0b]" />
          </button>
        </div>

      </div>
    </div>
  );
}
