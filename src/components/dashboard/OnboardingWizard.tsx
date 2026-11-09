'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

export interface BusinessConfig {
  companyType: 'enskild_firma' | 'aktiebolag';
  companyName: string;
  orgNr: string;
  hasFSkatt: boolean;
  vatPeriod: 'quarterly' | 'monthly' | 'yearly';
  estimatedYearlyRevenue: number;
  municipalTaxRate: number; // e.g. 0.32
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                {step}
              </span>
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                Steg {step} av 4 • 60-sekunders konfigurering
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Bolagsform */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Vilken bolagsform driver du?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Klaro anpassar automatiskt reglerna för egenavgifter, schablonavdrag och bolagsskatt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Enskild Firma */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, companyType: 'enskild_firma' })}
                className={`p-4 rounded-xl border text-left transition space-y-2 ${
                  config.companyType === 'enskild_firma'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Enskild Firma</span>
                  {config.companyType === 'enskild_firma' && (
                    <Check className="w-4 h-4 text-emerald-400" />
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
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Aktiebolag (AB)</span>
                  {config.companyType === 'aktiebolag' && (
                    <Check className="w-4 h-4 text-emerald-400" />
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
              <h3 className="text-lg font-bold text-white">Dina företagsuppgifter</h3>
              <p className="text-zinc-400 mt-1">
                Används för fakturering och exakt Skatteverket OCR-generering.
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
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-medium focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
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
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Momsdeklarationsperiod */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Hur ofta redovisar du moms?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Klaro sätter automatiskt upp dina deklarationsdatum och momsdeadlines.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              {[
                {
                  id: 'quarterly',
                  title: 'Kvartalsvis (Vanligast för frilansare)',
                  desc: 'Deklareras 4 ggr/år (12 maj, 17 aug, 12 nov, 26 feb). Perfekt för omsättning upp till 40 MSEK.',
                },
                {
                  id: 'monthly',
                  title: 'Månadsvis',
                  desc: 'Deklareras varje månad den 12:e. Bra för jämnt kassaflöde eller vid export.',
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
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white block">{p.title}</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">{p.desc}</span>
                  </div>
                  {config.vatPeriod === p.id && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
              <h3 className="text-lg font-bold text-white">Uppskatta omsättning & skatt</h3>
              <p className="text-zinc-400 mt-1">
                Klaro använder dessa siffror för att beräkna din preliminärskatt och F-skattreserv.
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
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
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
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="font-mono font-bold text-sm text-emerald-400 w-16 text-right">
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
              className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition"
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
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm shadow-emerald-950"
          >
            <span>{step === 4 ? 'Slutför och öppna dashboard' : 'Nästa steg'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
