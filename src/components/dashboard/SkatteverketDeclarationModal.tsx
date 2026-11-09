'use client';

import React from 'react';
import { MomsCalculation } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { X, FileSpreadsheet, Download, Copy, Check, Info, ShieldCheck, Printer } from 'lucide-react';

interface SkatteverketDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  moms: MomsCalculation;
  periodName: string;
  companyName: string;
  orgNr: string;
}

export function SkatteverketDeclarationModal({
  isOpen,
  onClose,
  moms,
  periodName,
  companyName,
  orgNr,
}: SkatteverketDeclarationModalProps) {
  const [copiedRuta, setCopiedRuta] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const { utgaendeBreakdown, ingaendeMoms, netMoms, status } = moms;

  const copyValue = (val: number, ruta: string) => {
    navigator.clipboard.writeText(Math.round(val).toString());
    setCopiedRuta(ruta);
    setTimeout(() => setCopiedRuta(null), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Skatteverket Momsdeklaration (SKV 4700)</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Officiell Blankettkopia
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {companyName} • Org.nr: {orgNr} • Redovisningsperiod: {periodName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Skriv ut deklarationsunderlag"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Klicka på kopiera-ikonen bredvid valfritt fält för att kopiera det avrundade heltalet direkt till Skatteverkets e-tjänst på <em>skatteverket.se</em>.
          </span>
        </div>

        {/* Section A: Momspliktig Försäljning */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>A. Momspliktig försäljning exkl. moms (Underlag)</span>
            <span className="text-[10px] text-zinc-500 normal-case">Kronor (avrundat till heltalsbelopp)</span>
          </h4>

          <div className="space-y-2 text-xs">
            {/* Ruta 05 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                    Ruta 05
                  </span>
                  <span className="font-medium text-zinc-200">Momspliktig försäljning som inte ingår i ruta 06, 07 eller 08 (25%)</span>
                </div>
                <span className="text-[11px] text-zinc-500">Programvaror, IT-konsultarvoden, standardtjänster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white">
                  {formatSEK(Math.round(utgaendeBreakdown[25]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[25]?.netBase || 0, '05')}
                  className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"
                  title="Kopiera belopp"
                >
                  {copiedRuta === '05' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ruta 06 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[11px]">
                    Ruta 06
                  </span>
                  <span className="font-medium text-zinc-200">Momspliktig försäljning av livsmedel, restaurang och logi (12%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white">
                  {formatSEK(Math.round(utgaendeBreakdown[12]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[12]?.netBase || 0, '06')}
                  className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"
                >
                  {copiedRuta === '06' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ruta 07 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[11px]">
                    Ruta 07
                  </span>
                  <span className="font-medium text-zinc-200">Momspliktig försäljning av persontransporter, böcker, kultur (6%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white">
                  {formatSEK(Math.round(utgaendeBreakdown[6]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[6]?.netBase || 0, '07')}
                  className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"
                >
                  {copiedRuta === '07' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Utgående moms */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            B. Utgående moms på försäljning (Skattebelopp)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Ruta 10 */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
                  Ruta 10
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[25]?.vatAmount || 0, '10')}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  {copiedRuta === '10' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-zinc-400 text-[11px]">Utgående moms 25%</div>
              <div className="mt-1 font-mono font-bold text-base text-zinc-100">
                {formatSEK(Math.round(utgaendeBreakdown[25]?.vatAmount || 0))}
              </div>
            </div>

            {/* Ruta 11 */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[11px]">
                  Ruta 11
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[12]?.vatAmount || 0, '11')}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  {copiedRuta === '11' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-zinc-400 text-[11px]">Utgående moms 12%</div>
              <div className="mt-1 font-mono font-bold text-base text-zinc-100">
                {formatSEK(Math.round(utgaendeBreakdown[12]?.vatAmount || 0))}
              </div>
            </div>

            {/* Ruta 12 */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[11px]">
                  Ruta 12
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[6]?.vatAmount || 0, '12')}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  {copiedRuta === '12' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-zinc-400 text-[11px]">Utgående moms 6%</div>
              <div className="mt-1 font-mono font-bold text-base text-zinc-100">
                {formatSEK(Math.round(utgaendeBreakdown[6]?.vatAmount || 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Ingående moms (Avdrag) */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            C. Ingående moms (Avdragsgill skatt på kvitton)
          </h4>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-emerald-500/30 bg-emerald-950/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[11px]">
                  Ruta 48
                </span>
                <span className="font-semibold text-emerald-300">Ingående moms att dra av</span>
              </div>
              <span className="text-[11px] text-zinc-400">Summan av all godkänd moms på inlästa och verifierade utgiftskvitton</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-emerald-400">
                {formatSEK(Math.round(ingaendeMoms))}
              </span>
              <button
                onClick={() => copyValue(ingaendeMoms, '48')}
                className="p-1 text-zinc-500 hover:text-white"
              >
                {copiedRuta === '48' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section D: SLUTLIG SKATT ATT BETALA ELLER FÅ TILLBAKA */}
        <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-xs">
                Ruta 49
              </span>
              <span className="font-bold text-sm text-white">
                Moms att betala (+) eller få tillbaka (-)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-extrabold font-mono ${
                status === 'to_pay' ? 'text-amber-400' : status === 'refund' ? 'text-emerald-400' : 'text-zinc-300'
              }`}>
                {status === 'to_pay' ? `+${formatSEK(Math.round(netMoms))}` : status === 'refund' ? `-${formatSEK(Math.round(Math.abs(netMoms)))}` : '0 kr'}
              </span>
              <button
                onClick={() => copyValue(Math.abs(netMoms), '49')}
                className="p-1 text-zinc-500 hover:text-white"
              >
                {copiedRuta === '49' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            {status === 'to_pay'
              ? 'Detta belopp dras från ditt skattekonto hos Skatteverket vid deklarationsdatumet. Klaro har redan reserverat hela beloppet i din skattebuffert.'
              : 'Du har betalat mer moms på inköp än du fakturerat ut. Skatteverket betalar ut överskjutande belopp till ditt skattekonto.'}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Underlag validerat enligt Skatteverkets Mervärdesskattelag 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
          >
            Klar med deklarationsunderlag
          </button>
        </div>

      </div>
    </div>
  );
}
