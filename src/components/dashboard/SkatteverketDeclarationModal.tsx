'use client';

import React from 'react';
import { MomsCalculation } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { X, FileSpreadsheet, Copy, Check, Info, ShieldCheck, Printer } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-3xl w-full p-6 shadow-xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900">Momsdeklaration (SKV 4700)</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Officiell Blankettkopia
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {companyName} • Org.nr: {orgNr} • Period: {periodName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
              title="Skriv ut deklarationsunderlag"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-600">
          <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <span>
            Klicka på kopiera-ikonen bredvid valfritt fält för att kopiera det avrundade heltalet direkt till Skatteverkets e-tjänst.
          </span>
        </div>

        {/* Section A: Momspliktig Försäljning */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>A. Momspliktig försäljning exkl. moms (Underlag)</span>
            <span className="text-[10px] text-zinc-400 normal-case">Kronor (avrundat till heltal)</span>
          </h4>

          <div className="space-y-2 text-xs">
            {/* Ruta 05 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                    Ruta 05
                  </span>
                  <span className="font-semibold text-zinc-900">Momspliktig försäljning 25%</span>
                </div>
                <span className="text-[11px] text-zinc-500">Programvaror, konsultarvoden, standardtjänster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-zinc-950 tabular-nums">
                  {formatSEK(Math.round(utgaendeBreakdown[25]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[25]?.netBase || 0, '05')}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-200/60"
                  title="Kopiera belopp"
                >
                  {copiedRuta === '05' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ruta 06 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                    Ruta 06
                  </span>
                  <span className="font-semibold text-zinc-900">Momspliktig försäljning 12%</span>
                </div>
                <span className="text-[11px] text-zinc-500">Restaurang, livsmedel, hotellverksamhet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-zinc-950 tabular-nums">
                  {formatSEK(Math.round(utgaendeBreakdown[12]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[12]?.netBase || 0, '06')}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-200/60"
                >
                  {copiedRuta === '06' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ruta 07 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                    Ruta 07
                  </span>
                  <span className="font-semibold text-zinc-900">Momspliktig försäljning 6%</span>
                </div>
                <span className="text-[11px] text-zinc-500">Persontransporter, böcker, kultur</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-zinc-950 tabular-nums">
                  {formatSEK(Math.round(utgaendeBreakdown[6]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[6]?.netBase || 0, '07')}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-200/60"
                >
                  {copiedRuta === '07' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Utgående moms */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            B. Utgående moms på försäljning (Skattebelopp)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Ruta 10 */}
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                  Ruta 10
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[25]?.vatAmount || 0, '10')}
                  className="p-1 text-zinc-400 hover:text-zinc-700"
                >
                  {copiedRuta === '10' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-zinc-500 text-[11px]">Utgående moms 25%</div>
              <div className="mt-1 font-mono font-bold text-base text-zinc-950 tabular-nums">
                {formatSEK(Math.round(utgaendeBreakdown[25]?.vatAmount || 0))}
              </div>
            </div>

            {/* Ruta 11 */}
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                  Ruta 11
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[12]?.vatAmount || 0, '11')}
                  className="p-1 text-zinc-400 hover:text-zinc-700"
                >
                  {copiedRuta === '11' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-zinc-500 text-[11px]">Utgående moms 12%</div>
              <div className="mt-1 font-mono font-bold text-base text-zinc-950 tabular-nums">
                {formatSEK(Math.round(utgaendeBreakdown[12]?.vatAmount || 0))}
              </div>
            </div>

            {/* Ruta 12 */}
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                  Ruta 12
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[6]?.vatAmount || 0, '12')}
                  className="p-1 text-zinc-400 hover:text-zinc-700"
                >
                  {copiedRuta === '12' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-zinc-500 text-[11px]">Utgående moms 6%</div>
              <div className="mt-1 font-mono font-bold text-base text-zinc-950 tabular-nums">
                {formatSEK(Math.round(utgaendeBreakdown[6]?.vatAmount || 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Ingående moms (Avdrag) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            C. Ingående moms (Avdragsgill skatt på inköp)
          </h4>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-zinc-800 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 text-[11px]">
                  Ruta 48
                </span>
                <span className="font-bold text-zinc-900">Ingående moms att dra av</span>
              </div>
              <span className="text-[11px] text-zinc-500">Summan av godkänd moms på inlästa och verifierade utgiftskvitton</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-zinc-950 tabular-nums">
                {formatSEK(Math.round(ingaendeMoms))}
              </span>
              <button
                onClick={() => copyValue(ingaendeMoms, '48')}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                {copiedRuta === '48' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section D: Slutlig moms */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-zinc-800 bg-zinc-200 px-2 py-0.5 rounded border border-zinc-300 text-xs">
                Ruta 49
              </span>
              <span className="font-bold text-sm text-zinc-900">
                Moms att betala (+) eller få tillbaka (-)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold font-mono text-zinc-950 tabular-nums">
                {status === 'to_pay' ? `+${formatSEK(Math.round(netMoms))}` : status === 'refund' ? `-${formatSEK(Math.round(Math.abs(netMoms)))}` : '0 kr'}
              </span>
              <button
                onClick={() => copyValue(Math.abs(netMoms), '49')}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                {copiedRuta === '49' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600">
            {status === 'to_pay'
              ? 'Detta belopp inbetalas till ditt skattekonto senast på deklarationsdagen. Klaro reserverar beloppet i din skattebuffert.'
              : 'Du har betalat mer moms på inköp än du fakturerat ut. Skatteverket betalar ut överskjutande belopp till ditt skattekonto.'}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-600" />
            <span>Underlag beräknat enligt Mervärdesskattelagen</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition shadow-xs"
          >
            Klar med underlag
          </button>
        </div>

      </div>
    </div>
  );
}
