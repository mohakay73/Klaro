'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X,
  Building2,
  CreditCard,
  Calendar,
  Percent,
  Smartphone,
  Landmark,
  Save,
  CheckCircle2
} from 'lucide-react';

export interface BusinessConfig {
  companyType: 'enskild_firma' | 'aktiebolag';
  companyName: string;
  orgNr: string;
  hasFSkatt: boolean;
  vatPeriod: 'quarterly' | 'monthly' | 'yearly';
  estimatedYearlyRevenue: number;
  municipalTaxRate: number;
  bankgiro?: string;
  swishNumber?: string;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: BusinessConfig;
  onComplete: (config: BusinessConfig) => void | Promise<void>;
  isSaving?: boolean;
}

export function OnboardingWizard({
  isOpen,
  onClose,
  initialConfig,
  onComplete,
  isSaving = false,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BusinessConfig>({
    ...initialConfig,
    bankgiro: initialConfig.bankgiro || '5050-1055',
    swishNumber: initialConfig.swishNumber || '123 456 78 90',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig({
        ...initialConfig,
        bankgiro: initialConfig.bankgiro || '5050-1055',
        swishNumber: initialConfig.swishNumber || '123 456 78 90',
      });
      setSaveSuccess(false);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await onComplete(config);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
      setSaveSuccess(false);
    }, 600);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const tabs = [
    { num: 1, label: 'Bolagsform', icon: Building2 },
    { num: 2, label: 'Företag & Betalning', icon: Landmark },
    { num: 3, label: 'Momsperiod', icon: Calendar },
    { num: 4, label: 'Skatt & Omsättning', icon: Percent },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-[#e7e2d7] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header with Title and Close button */}
        <div className="flex items-start justify-between border-b border-[#e7e2d7] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d97706]" />
              <h2 className="text-base font-bold text-[#1c1917]">
                Företagsprofil & Inställningar
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Dina uppgifter sparas direkt i din Neon PostgreSQL-profil och styr skatt, moms & fakturering.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-[#f7f4ee] transition cursor-pointer"
            title="Stäng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Step Navigator Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f7f4ee] rounded-xl border border-[#e7e2d7]">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = step === t.num;
            return (
              <button
                key={t.num}
                type="button"
                onClick={() => setStep(t.num)}
                className={`py-2 px-1.5 rounded-lg text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1c1917] shadow-xs font-bold border border-[#e7e2d7]'
                    : 'text-stone-500 hover:text-stone-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#d97706]' : 'text-stone-400'}`} />
                  <span className="text-[11px] font-mono">{t.num}</span>
                </div>
                <span className="text-[10px] truncate max-w-full leading-tight hidden sm:inline">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step 1: Bolagsform */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-[#1c1917]">Vilken bolagsform driver du?</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Klaro anpassar automatiskt beräkningen för egenavgifter, schablonavdrag och skattereserver.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                    <span className="w-5 h-5 rounded-full bg-[#1c1917] flex items-center justify-center text-[#f59e0b]">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  För frilansare & konsulter med F-skatt. Beskattas med egenavgifter (28,97%) & kommunalskatt.
                </p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-[#b45309] font-bold">
                    Egenavgifter 28.97%
                  </span>
                </div>
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
                    <span className="w-5 h-5 rounded-full bg-[#1c1917] flex items-center justify-center text-[#f59e0b]">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Juridisk person med fast bolagsskatt (20,6%). Lön och utdelning hanteras separat.
                </p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Bolagsskatt 20.6%
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Företagsuppgifter, F-skatt, Bankgiro & Swish */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div>
              <h3 className="text-sm font-bold text-[#1c1917]">Företagsuppgifter & Betalning</h3>
              <p className="text-stone-500 mt-0.5">
                Dessa uppgifter skrivs ut på dina kundfakturor och genererar den scanningsbara Swish QR-koden.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Företagsnamn</label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  placeholder="Lindqvist Digital Design"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7e2d7] text-[#1c1917] font-semibold focus:outline-none focus:border-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
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
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7e2d7] text-[#1c1917] font-mono focus:outline-none focus:border-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
                />
              </div>

              {/* Bankgiro & Swish 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-stone-500" />
                    <span>Bankgironummer</span>
                  </label>
                  <input
                    type="text"
                    value={config.bankgiro || ''}
                    onChange={(e) => setConfig({ ...config, bankgiro: e.target.value })}
                    placeholder="5050-1055"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7e2d7] text-[#1c1917] font-mono font-bold focus:outline-none focus:border-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">För banköverföring på fakturan</span>
                </div>

                <div>
                  <label className="text-stone-700 font-semibold block mb-1 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                    <span>Swish Företag</span>
                  </label>
                  <input
                    type="text"
                    value={config.swishNumber || ''}
                    onChange={(e) => setConfig({ ...config, swishNumber: e.target.value })}
                    placeholder="123 456 78 90"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7e2d7] text-[#1c1917] font-mono font-bold focus:outline-none focus:border-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">För mobil scanning med Swish QR-kod</span>
                </div>
              </div>

              {/* F-skatt toggle */}
              <div className="p-3.5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#1c1917]">Godkänd för F-skatt</span>
                    <span className="text-[10px] bg-emerald-100 text-[#15803d] font-bold px-1.5 py-0.5 rounded">
                      Rekommenderat
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Visas som "Godkänd för F-skatt" på alla kundfakturor enligt Skatteverkets krav.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hasFSkatt}
                    onChange={(e) => setConfig({ ...config, hasFSkatt: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#15803d]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Momsdeklarationsperiod */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-[#1c1917]">Hur ofta redovisar du moms?</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Klaro ställer in dina deklarationsdatum och momsdeadlines automatiskt.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {[
                {
                  id: 'quarterly',
                  title: 'Kvartalsvis (Vanligast för frilansare & småföretag)',
                  desc: 'Deklareras 4 ggr/år (12 maj, 17 aug, 12 nov, 26 feb).',
                },
                {
                  id: 'monthly',
                  title: 'Månadsvis',
                  desc: 'Deklareras varje månad den 12:e (eller 26:e för stora bolag).',
                },
                {
                  id: 'yearly',
                  title: 'Årsvis (Helårsmoms)',
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
                    <span className="w-5 h-5 rounded-full bg-[#1c1917] flex items-center justify-center text-[#f59e0b] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
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
              <h3 className="text-sm font-bold text-[#1c1917]">Omsättning & Skattesats</h3>
              <p className="text-stone-500 mt-0.5">
                Klaro använder dessa uppgifter för att beräkna din preliminärskatt och F-skattreserv.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">
                  Uppskattad årsomsättning (SEK exkl. moms)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={config.estimatedYearlyRevenue}
                  onChange={(e) => setConfig({ ...config, estimatedYearlyRevenue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7e2d7] text-[#1c1917] font-mono font-bold text-sm focus:outline-none focus:border-[#1c1917] tabular-nums"
                />
                <span className="text-[11px] text-stone-500 mt-1 block font-mono">
                  Motsvarar ca {Math.round(config.estimatedYearlyRevenue / 12).toLocaleString('sv-SE')} kr / månad
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-stone-700 font-semibold">
                    Kommunalskattesats (Snitt i Sverige ca 32%)
                  </label>
                  <span className="font-mono font-bold text-sm text-[#1c1917] tabular-nums">
                    {(config.municipalTaxRate * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.29"
                  max="0.35"
                  step="0.001"
                  value={config.municipalTaxRate}
                  onChange={(e) => setConfig({ ...config, municipalTaxRate: Number(e.target.value) })}
                  className="w-full accent-[#1c1917] cursor-pointer"
                />
                {/* City Presets */}
                <div className="flex gap-2 mt-2 pt-1">
                  {[
                    { city: 'Stockholm (29.8%)', rate: 0.298 },
                    { city: 'Göteborg (32.6%)', rate: 0.326 },
                    { city: 'Malmö (32.4%)', rate: 0.324 },
                  ].map((preset) => (
                    <button
                      key={preset.city}
                      type="button"
                      onClick={() => setConfig({ ...config, municipalTaxRate: preset.rate })}
                      className="px-2 py-1 rounded bg-[#f7f4ee] hover:bg-[#eee8dc] text-[10px] text-stone-600 font-semibold border border-[#e7e2d7] transition cursor-pointer"
                    >
                      {preset.city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e7e2d7]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl border border-[#e7e2d7] hover:bg-[#f7f4ee] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Föregående</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 4 && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl border border-[#e7e2d7] hover:bg-[#f7f4ee] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Spara nu utan att gå genom alla steg"
              >
                <Save className="w-3.5 h-3.5 text-stone-500" />
                <span>Spara direkt</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sparat i Neon!</span>
                </>
              ) : step === 4 ? (
                <>
                  <Save className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>{isSaving ? 'Sparar...' : 'Spara inställningar'}</span>
                </>
              ) : (
                <>
                  <span>Nästa</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#f59e0b]" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
