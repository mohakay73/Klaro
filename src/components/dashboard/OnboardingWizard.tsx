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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-xs font-medium flex items-center justify-center border border-zinc-700/60">
                {step}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Steg {step} av 4 • Företagsinställningar
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-200 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Bolagsform */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Vilken bolagsform driver du?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Klaro anpassar beräkningen för egenavgifter, schablonavdrag och skattereserver.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Enskild Firma */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, companyType: 'enskild_firma' })}
                className={`p-4 rounded-xl border text-left transition space-y-2 ${
                  config.companyType === 'enskild_firma'
                    ? 'border-zinc-500 bg-zinc-800/60 ring-1 ring-zinc-500'
                    : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-zinc-100">Enskild Firma</span>
                  {config.companyType === 'enskild_firma' && (
                    <Check className="w-4 h-4 text-zinc-200" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  För frilansare & konsulter med F-skatt. Beskattas med egenavgifter (28,97%) & kommunalskatt.
                </p>
              </button>

              {/* Aktiebolag */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, companyType: 'aktiebolag' })}
                className={`p-4 rounded-xl border text-left transition space-y-2 ${
                  config.companyType === 'aktiebolag'
                    ? 'border-zinc-500 bg-zinc-800/60 ring-1 ring-zinc-500'
                    : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-zinc-100">Aktiebolag (AB)</span>
                  {config.companyType === 'aktiebolag' && (
                    <Check className="w-4 h-4 text-zinc-200" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
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
              <h3 className="text-base font-semibold text-zinc-100">Dina företagsuppgifter</h3>
              <p className="text-zinc-400 mt-1">
                Används för fakturering och OCR-generering för inbetalningar.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Företagsnamn</label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  placeholder="Lindqvist Digital Design"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-medium focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  Organisationsnummer eller Personnummer (10 siffror)
                </label>
                <input
                  type="text"
                  value={config.orgNr}
                  onChange={(e) => setConfig({ ...config, orgNr: e.target.value })}
                  placeholder="559123-4567 eller ÅÅMMDD-XXXX"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-200">Godkänd för F-skatt</span>
                  <p className="text-[11px] text-zinc-500">Måste framgå på alla fakturor till svenska kunder</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.hasFSkatt}
                  onChange={(e) => setConfig({ ...config, hasFSkatt: e.target.checked })}
                  className="w-4 h-4 rounded text-zinc-200 focus:ring-zinc-500 bg-zinc-900 border-zinc-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Momsdeklarationsperiod */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Hur ofta redovisar du moms?</h3>
              <p className="text-xs text-zinc-400 mt-1">
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
                  className={`w-full p-3.5 rounded-xl border text-left transition flex items-start justify-between ${
                    config.vatPeriod === p.id
                      ? 'border-zinc-500 bg-zinc-800/60 ring-1 ring-zinc-500'
                      : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-zinc-100 block">{p.title}</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">{p.desc}</span>
                  </div>
                  {config.vatPeriod === p.id && (
                    <Check className="w-4 h-4 text-zinc-200 shrink-0 mt-0.5" />
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
              <h3 className="text-base font-semibold text-zinc-100">Omsättning & Skattesats</h3>
              <p className="text-zinc-400 mt-1">
                Klaro använder dessa uppgifter för att beräkna din preliminärskatt och F-skattreserv.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  Uppskattad årsomsättning (SEK exkl. moms)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={config.estimatedYearlyRevenue}
                  onChange={(e) => setConfig({ ...config, estimatedYearlyRevenue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono font-semibold text-sm focus:outline-none focus:border-zinc-500 tabular-nums"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block font-mono">
                  Ca {(config.estimatedYearlyRevenue / 12).toFixed(0)} kr / månad
                </span>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
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
                    className="flex-1 accent-zinc-200"
                  />
                  <span className="font-mono font-semibold text-sm text-zinc-100 w-16 text-right tabular-nums">
                    {(config.municipalTaxRate * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Stockholm: 29.8% • Göteborg: 32.6% • Malmö: 32.4%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition"
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
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <span>{step === 4 ? 'Spara inställningar' : 'Nästa'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
