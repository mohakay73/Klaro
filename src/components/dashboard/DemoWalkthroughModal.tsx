'use client';

import React, { useState } from 'react';
import { ActiveView } from './Sidebar';
import { BusinessConfig } from './OnboardingWizard';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  ShieldCheck, 
  Receipt, 
  FileCheck, 
  Landmark, 
  Calculator, 
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Building2,
  UserCheck
} from 'lucide-react';

export type DemoScenario = 'standard_ef' | 'new_ab' | 'all_reconciled';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onLoadScenario?: (scenario: DemoScenario) => void;
  onResetDemoData?: () => void;
  onOpenUpload?: () => void;
  onOpenInvoiceBuilder?: () => void;
  onOpenPayMoms?: () => void;
  onOpenDeclaration?: () => void;
}

interface TourStep {
  stepNumber: number;
  view: ActiveView;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  keyPoints: string[];
  actionLabel?: string;
  actionIcon?: React.ElementType;
  actionHandler?: () => void;
}

export function DemoWalkthroughModal({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onLoadScenario,
  onResetDemoData,
  onOpenUpload,
  onOpenInvoiceBuilder,
  onOpenPayMoms,
  onOpenDeclaration,
}: DemoWalkthroughModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>('standard_ef');

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      stepNumber: 1,
      view: 'overview',
      badge: 'Skattekonto & Buffert',
      title: 'Säkert att ta ut i realtid',
      subtitle: 'Sluta gissa hur mycket pengar på kontot som faktiskt är dina',
      description:
        'Klaro beräknar din skuld till Skatteverket vid varje enskild transaktion. Pengarna delas upp i disponibelt belopp, momsreserv (25%/12%/6%) och preliminär skatt/egenavgifter.',
      keyPoints: [
        'Automatiskt avdrag för moms och F-skatt enligt Skatteverkets regler',
        'Taktilt Skattekonto-kort med kopierbart Bankgiro 5050-1055',
        'Klarhet i vad du kan ta ut som lön eller eget uttag utan skattechocker',
      ],
      actionLabel: 'Se Cockpit & Saldon',
      actionIcon: Eye,
      actionHandler: () => onSelectView('overview'),
    },
    {
      stepNumber: 2,
      view: 'expenses',
      badge: 'Bokföringslagen',
      title: 'Automatisk AI-kvittotolkning',
      subtitle: 'Alla affärshändelser styrks med rätt BAS-konto och momssats',
      description:
        'Fota med mobilen, ladda upp PDF eller vidarebefordra kvitton via e-post. Klaro läser ut leverantör, belopp, datum, moms och föreslår rätt BAS-konto (t.ex. 5420 Programvaror, 5800 Resor).',
      keyPoints: [
        'Hanterar 25%, 12%, 6% och momsfria representationer automatiskt',
        'Varnar vid tvetydiga kvitton som kräver granskning',
        'Full överensstämmelse med 7 kap. Bokföringslagen',
      ],
      actionLabel: 'Testa att tolka kvitto',
      actionIcon: Receipt,
      actionHandler: () => {
        onSelectView('expenses');
        if (onOpenUpload) onOpenUpload();
      },
    },
    {
      stepNumber: 3,
      view: 'invoices',
      badge: 'Kundfakturering',
      title: 'Svensk A4 PDF-fakturering',
      subtitle: 'Fakturor som automatiskt uppdaterar din skattebuffert',
      description:
        'Skapa professionella fakturor som uppfyller Mervärdesskattelagen med ditt organisationsnummer, godkänd för F-skatt, Bankgiro och OCR-referens. När du skapar en faktura reserveras utgående moms direkt i bufferten!',
      keyPoints: [
        'Utskriftsoptimerad A4-layout med Swish Företag & Bankgiro',
        'Automatisk beräkning av 25%, 12% eller 6% utgående moms',
        '1-klick förhandsgranskning & PDF-nedladdning',
      ],
      actionLabel: 'Öppna fakturamall',
      actionIcon: FileCheck,
      actionHandler: () => {
        onSelectView('invoices');
        if (onOpenInvoiceBuilder) onOpenInvoiceBuilder();
      },
    },
    {
      stepNumber: 4,
      view: 'bank',
      badge: 'Open Banking PSD2',
      title: 'Smart Bankavstämning & Skatterisk',
      subtitle: 'Koppla kontoutdraget mot kvitton och undvik förlorade skatteavdrag',
      description:
        'Koppla ditt företagskonto via PSD2. Klaro matchar inkommande betalningar mot fakturor och kortköp mot kvitton. Saknas kvitto beräknar Klaro exakt hur mycket skatteavdrag du riskerar att förlora!',
      keyPoints: [
        'Kalkylator för uteblivet momsavdrag och ökad inkomstskatt',
        '1-klick för "Eget uttag (BAS 2013)" vid privata Swish/matinköp',
        'Snabbkoppling för att skapa digitalt verifikat direkt',
      ],
      actionLabel: 'Utforska Bankavstämning',
      actionIcon: Landmark,
      actionHandler: () => onSelectView('bank'),
    },
    {
      stepNumber: 5,
      view: 'tax',
      badge: 'Skatteverket SKV 4700',
      title: 'Officiell Momsdeklaration & Simulator',
      subtitle: 'Skatteverkets rutor klara att lämna in utan revisor',
      description:
        'Klaro mappar dina siffror direkt in i Skatteverkets blanketter (Ruta 05, Ruta 48, Ruta 49). Dessutom kan du dra i skjutreglagen i skattesimulatorn för att se vad en ny fakturering eller utgift gör med din skatt!',
      keyPoints: [
        'Kopiera belopp med ett klick direkt in i Skatteverkets e-tjänst',
        'Interaktiv simulator för att planera inköp och momsutbetalningar',
        'Exportera till standardiserad SIE-4 fil för din bokföringsbyrå',
      ],
      actionLabel: 'Se Deklarationsunderlag',
      actionIcon: Calculator,
      actionHandler: () => {
        onSelectView('tax');
        if (onOpenDeclaration) onOpenDeclaration();
      },
    },
  ];

  const currentStep = tourSteps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onSelectView(tourSteps[nextIndex].view);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onSelectView(tourSteps[prevIndex].view);
    }
  };

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    if (onLoadScenario) {
      onLoadScenario(scenario);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div className="bg-white border border-[#e7e2d7] rounded-t-3xl sm:rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Top Header: Step Indicator & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706] shrink-0">
              <Sparkles className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">Guidad Snabbdemo (60s)</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
                  Steg {currentStep.stepNumber} av {tourSteps.length}
                </span>
              </div>
              <p className="text-xs text-stone-500">Lär dig hur Klaro automatiserar skatt och bokföring</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#f7f4ee] flex items-center justify-center transition cursor-pointer"
            title="Stäng rundtur"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Segmented Bar */}
        <div className="grid grid-cols-5 gap-1.5">
          {tourSteps.map((step, idx) => (
            <button
              key={step.stepNumber}
              onClick={() => {
                setCurrentStepIndex(idx);
                onSelectView(step.view);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-[#1c1917]'
                  : idx < currentStepIndex
                    ? 'bg-[#d97706]'
                    : 'bg-[#e7e2d7] hover:bg-stone-300'
              }`}
              title={`Hoppa till steg ${step.stepNumber}: ${step.title}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div>
            <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#1c1917] bg-[#f7f4ee] px-2.5 py-0.5 rounded border border-[#e7e2d7] mb-2">
              {currentStep.badge}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#1c1917] tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {currentStep.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-[#f7f4ee] p-3.5 rounded-xl border border-[#e7e2d7]">
            {currentStep.description}
          </p>

          {/* Key Bullet Points */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Varför detta är viktigt:
            </span>
            <div className="space-y-1.5 text-xs text-stone-700">
              {currentStep.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual Interactive Action for Current Step */}
          {currentStep.actionLabel && currentStep.actionHandler && (
            <div className="pt-2">
              <button
                type="button"
                onClick={currentStep.actionHandler}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] hover:bg-[#eee8dc] text-[#1c1917] font-bold text-xs transition cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  {currentStep.actionIcon && (
                    <currentStep.actionIcon className="w-4 h-4 text-[#d97706]" />
                  )}
                  <span>{currentStep.actionLabel}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#d97706] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

        </div>

        {/* Demo Scenario Switcher Strip */}
        <div className="pt-4 border-t border-[#e7e2d7] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Byt testsituation:</span>
            </span>
            {onResetDemoData && (
              <button
                type="button"
                onClick={onResetDemoData}
                className="text-xs text-stone-500 hover:text-[#1c1917] underline font-medium cursor-pointer"
              >
                Återställ demo
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectScenario('standard_ef')}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                selectedScenario === 'standard_ef'
                  ? 'border-[#1c1917] bg-[#1c1917] text-white font-bold shadow-2xs'
                  : 'border-[#e7e2d7] bg-white text-stone-700 hover:bg-[#f7f4ee]'
              }`}
            >
              <div className="font-semibold truncate">Enskild Firma</div>
              <div className={`text-[10px] ${selectedScenario === 'standard_ef' ? 'text-[#f59e0b]' : 'text-stone-400'}`}>124k disponibelt</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectScenario('new_ab')}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                selectedScenario === 'new_ab'
                  ? 'border-[#1c1917] bg-[#1c1917] text-white font-bold shadow-2xs'
                  : 'border-[#e7e2d7] bg-white text-stone-700 hover:bg-[#f7f4ee]'
              }`}
            >
              <div className="font-semibold truncate">Aktiebolag (AB)</div>
              <div className={`text-[10px] ${selectedScenario === 'new_ab' ? 'text-[#f59e0b]' : 'text-stone-400'}`}>Bolagsskatt 20.6%</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectScenario('all_reconciled')}
              className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                selectedScenario === 'all_reconciled'
                  ? 'border-[#1c1917] bg-[#1c1917] text-white font-bold shadow-2xs'
                  : 'border-[#e7e2d7] bg-white text-stone-700 hover:bg-[#f7f4ee]'
              }`}
            >
              <div className="font-semibold truncate">100% Avstämd</div>
              <div className={`text-[10px] ${selectedScenario === 'all_reconciled' ? 'text-[#f59e0b]' : 'text-stone-400'}`}>0 kr skatterisk</div>
            </button>
          </div>
        </div>

        {/* Modal Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e7e2d7]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-2 rounded-xl border border-[#e7e2d7] bg-white hover:bg-[#f7f4ee] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Föregående</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-stone-500 hover:text-[#1c1917] text-xs font-semibold cursor-pointer"
            >
              Avsluta tur
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
            >
              <span>{currentStepIndex === tourSteps.length - 1 ? 'Klar!' : 'Nästa steg'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#f59e0b]" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
