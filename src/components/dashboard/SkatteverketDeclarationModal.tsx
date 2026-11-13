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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-t-3xl sm:rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <FileSpreadsheet className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">Momsdeklaration (SKV 4700)</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
                  Officiell Blankettkopia
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {companyName} • Org.nr: {orgNr} • Period: {periodName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
              title="Skriv ut deklarationsunderlag"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-start gap-2.5 text-xs text-stone-600">
          <Info className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
          <span>
            Klicka på kopiera-ikonen bredvid valfritt fält för att kopiera det avrundade heltalet direkt till Skatteverkets e-tjänst.
          </span>
        </div>

        {/* Section A: Momspliktig Försäljning */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
            <span>A. Momspliktig försäljning exkl. moms (Underlag)</span>
            <span className="text-[10px] text-stone-400 normal-case">Kronor (avrundat till heltal)</span>
          </h4>

          <div className="space-y-2 text-xs">
            {/* Ruta 05 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] hover:border-stone-400 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                    Ruta 05
                  </span>
                  <span className="font-semibold text-[#1c1917]">Momspliktig försäljning 25%</span>
                </div>
                <span className="text-[11px] text-stone-500">Programvaror, konsultarvoden, standardtjänster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#1c1917] tabular-nums">
                  {formatSEK(Math.round(utgaendeBreakdown[25]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[25]?.netBase || 0, '05')}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-[#eee8dc] cursor-pointer"
                  title="Kopiera belopp"
                >
                  {copiedRuta === '05' ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ruta 06 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] hover:border-stone-400 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                    Ruta 06
                  </span>
                  <span className="font-semibold text-[#1c1917]">Momspliktig försäljning 12%</span>
                </div>
                <span className="text-[11px] text-stone-500">Restaurang, livsmedel, hotellverksamhet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#1c1917] tabular-nums">
                  {formatSEK(Math.round(utgaendeBreakdown[12]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[12]?.netBase || 0, '06')}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-[#eee8dc] cursor-pointer"
                >
                  {copiedRuta === '06' ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ruta 07 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] hover:border-stone-400 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                    Ruta 07
                  </span>
                  <span className="font-semibold text-[#1c1917]">Momspliktig försäljning 6%</span>
                </div>
                <span className="text-[11px] text-stone-500">Persontransporter, böcker, kultur</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#1c1917] tabular-nums">
                  {formatSEK(Math.round(utgaendeBreakdown[6]?.netBase || 0))}
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[6]?.netBase || 0, '07')}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-[#eee8dc] cursor-pointer"
                >
                  {copiedRuta === '07' ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Utgående moms */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            B. Utgående moms på försäljning (Skattebelopp)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Ruta 10 */}
            <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                  Ruta 10
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[25]?.vatAmount || 0, '10')}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {copiedRuta === '10' ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-stone-500 text-[11px]">Utgående moms 25%</div>
              <div className="mt-1 font-mono font-bold text-base text-[#1c1917] tabular-nums">
                {formatSEK(Math.round(utgaendeBreakdown[25]?.vatAmount || 0))}
              </div>
            </div>

            {/* Ruta 11 */}
            <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                  Ruta 11
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[12]?.vatAmount || 0, '11')}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {copiedRuta === '11' ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-stone-500 text-[11px]">Utgående moms 12%</div>
              <div className="mt-1 font-mono font-bold text-base text-[#1c1917] tabular-nums">
                {formatSEK(Math.round(utgaendeBreakdown[12]?.vatAmount || 0))}
              </div>
            </div>

            {/* Ruta 12 */}
            <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                  Ruta 12
                </span>
                <button
                  onClick={() => copyValue(utgaendeBreakdown[6]?.vatAmount || 0, '12')}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {copiedRuta === '12' ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="mt-1 text-stone-500 text-[11px]">Utgående moms 6%</div>
              <div className="mt-1 font-mono font-bold text-base text-[#1c1917] tabular-nums">
                {formatSEK(Math.round(utgaendeBreakdown[6]?.vatAmount || 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Ingående moms (Avdrag) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            C. Ingående moms (Avdragsgill skatt på inköp)
          </h4>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1c1917] bg-white px-1.5 py-0.5 rounded border border-[#e7e2d7] text-[11px]">
                  Ruta 48
                </span>
                <span className="font-bold text-[#1c1917]">Ingående moms att dra av</span>
              </div>
              <span className="text-[11px] text-stone-500">Summan av godkänd moms på inlästa och verifierade utgiftskvitton</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-[#15803d] tabular-nums">
                {formatSEK(Math.round(ingaendeMoms))}
              </span>
              <button
                onClick={() => copyValue(ingaendeMoms, '48')}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {copiedRuta === '48' ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section D: Slutlig moms */}
        <div className="p-4 rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#1c1917] bg-white px-2 py-0.5 rounded border border-[#e7e2d7] text-xs">
                Ruta 49
              </span>
              <span className="font-bold text-sm text-[#1c1917]">
                Moms att betala (+) eller få tillbaka (-)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-extrabold font-mono tabular-nums ${status === 'to_pay' ? 'text-[#b45309]' : 'text-[#15803d]'}`}>
                {status === 'to_pay' ? `+${formatSEK(Math.round(netMoms))}` : status === 'refund' ? `-${formatSEK(Math.round(Math.abs(netMoms)))}` : '0 kr'}
              </span>
              <button
                onClick={() => copyValue(Math.abs(netMoms), '49')}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {copiedRuta === '49' ? <Check className="w-4 h-4 text-[#15803d]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-stone-600">
            {status === 'to_pay'
              ? 'Detta belopp inbetalas till ditt skattekonto senast på deklarationsdagen. Klaro reserverar beloppet i din skattebuffert.'
              : 'Du har betalat mer moms på inköp än du fakturerat ut. Skatteverket betalar ut överskjutande belopp till ditt skattekonto.'}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-[#e7e2d7]">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#d97706]" />
            <span>Underlag beräknat enligt Mervärdesskattelagen</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            Klar med underlag
          </button>
        </div>

      </div>
    </div>
  );
}
