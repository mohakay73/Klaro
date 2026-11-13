'use client';

import React from 'react';
import { SwedishTaxBuffer } from '@/types/tax';
import { Invoice, Receipt } from '@/types/database';
import { BusinessConfig } from './OnboardingWizard';
import { MomsSummaryCard } from './MomsSummaryCard';
import { TaxSimulatorWidget } from './TaxSimulatorWidget';
import { ShieldCheck, HelpCircle, Info, Landmark, CheckCircle2 } from 'lucide-react';
import { formatSEK } from '@/lib/utils';

interface TaxViewProps {
  taxBuffer: SwedishTaxBuffer;
  businessConfig: BusinessConfig;
  invoices: Invoice[];
  receipts: Receipt[];
  onOpenDeclaration: () => void;
  onOpenPayMoms: () => void;
}

export function TaxView({
  taxBuffer,
  businessConfig,
  invoices,
  receipts,
  onOpenDeclaration,
  onOpenPayMoms,
}: TaxViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Official Swedish Skatteverket Momsdeklaration Card */}
      <MomsSummaryCard moms={taxBuffer.moms} />

      {/* 2. Interactive Tax Simulator */}
      <TaxSimulatorWidget
        currentInvoices={invoices}
        currentReceipts={receipts}
        companyType={businessConfig.companyType}
        municipalTaxRate={businessConfig.municipalTaxRate}
      />

      {/* 3. Swedish Tax Guide & Transparency Explainer */}
      <div className="rounded-2xl border border-[#e7e2d7] bg-white p-5 sm:p-7 space-y-6 text-sm text-stone-700 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#e7e2d7]">
          <ShieldCheck className="w-5 h-5 text-[#d97706]" />
          <h3 className="text-base font-bold text-[#1c1917]">
            Hur beräknar Klaro skattebuffert och säkert disponibelt belopp?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Enskild Firma Rules */}
          <div className="space-y-3.5 p-5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
            <h4 className="font-bold text-[#1c1917] text-sm">
              Enskild Firma (F-skatt & Egenavgifter)
            </h4>
            <p className="text-stone-600 leading-relaxed text-xs">
              I en enskild firma beskattas du på <strong>verksamhetens skattemässiga överskott</strong> (nettointäkter minus avdragsgilla kostnader exkl. moms):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-stone-600 text-xs">
              <li>
                <strong className="text-[#1c1917]">Schablonavdrag (25%):</strong> Automatiskt avdrag på 25% av vinsten före sociala avgifter.
              </li>
              <li>
                <strong className="text-[#1c1917]">Egenavgifter (28,97%):</strong> Beräknas på överskottet efter schablonavdrag.
              </li>
              <li>
                <strong className="text-[#1c1917]">Kommunalskatt (~{Math.round(businessConfig.municipalTaxRate * 100)}%):</strong> Dras på vinsten minus egenavgifterna.
              </li>
              <li>
                <strong className="text-[#1c1917]">Total F-skatt:</strong> Reserveras automatiskt för att undvika kvarskatt vid slutskattsedeln.
              </li>
            </ul>
          </div>

          {/* Moms Rules */}
          <div className="space-y-3.5 p-5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
            <h4 className="font-bold text-[#1c1917] text-sm">
              Mervärdesskatt (Momsdeklaration)
            </h4>
            <p className="text-stone-600 leading-relaxed text-xs">
              Moms är statens skatt som ditt företag kräver in och redovisar periodiskt till Skatteverket:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-stone-600 text-xs">
              <li>
                <strong className="text-[#1c1917]">Utgående moms:</strong> Moms på dina utställda kundfakturor (25%, 12%, 6%).
              </li>
              <li>
                <strong className="text-[#1c1917]">Ingående moms:</strong> Moms du betalat på verifierade utgiftskvitton (Ruta 48).
              </li>
              <li>
                <strong className="text-[#1c1917]">Netto moms:</strong> Mellanskillnaden som reserveras och inbetalas till Skatteverkets Bankgiro 5050-1055.
              </li>
            </ul>
          </div>

        </div>

        {/* Safe to Spend formula summary */}
        <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] text-sm">
          <span className="font-bold text-[#1c1917] block mb-1">
            Klaros formel för &quot;Säkert att ta ut&quot;:
          </span>
          <p className="text-stone-700 font-mono text-xs leading-relaxed">
            Säkert att ta ut = Nettointäkter - Verifierade nettoutgifter - Beräknad F-skatt (Egenavgifter + Kommunalskatt) - Netto moms
          </p>
        </div>

      </div>

    </div>
  );
}
