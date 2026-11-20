'use client';

import React, { useState } from 'react';
import { MomsCalculation } from '@/types/tax';
import { formatSEK } from '@/lib/utils';
import { getNextVatDeadline, VatDeadlineInfo } from '@/lib/vat-reminder';
import { 
  Scale, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Mail, 
  Calendar, 
  Landmark, 
  FileSpreadsheet, 
  Check, 
  Loader2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface MomsSummaryCardProps {
  moms: MomsCalculation;
  companyName?: string;
  orgNr?: string;
  userEmail?: string;
  onOpenDeclaration?: () => void;
  onOpenPayMoms?: () => void;
}

export function MomsSummaryCard({ 
  moms,
  companyName = 'Lindqvist Digital Design',
  orgNr = '559123-4567',
  userEmail = 'mohakay73@gmail.com',
  onOpenDeclaration,
  onOpenPayMoms,
}: MomsSummaryCardProps) {
  const { utgaendeMoms, ingaendeMoms, netMoms, utgaendeBreakdown, ingaendeBreakdown, status } = moms;
  
  // Calculate next official Skatteverket deadline
  const deadlineInfo: VatDeadlineInfo = getNextVatDeadline('quarterly');

  // Email sending state
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendEmailReminder = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/vat/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          companyName,
          orgNr,
          moms,
          periodType: 'quarterly',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Kunde inte skicka e-post');
      }

      setEmailStatus({
        type: 'success',
        message: `Momsunderlag skickat till ${userEmail}! Innehåller Skatteverkets rutor & OCR.`,
      });

      setTimeout(() => setEmailStatus(null), 6000);
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Ett fel uppstod vid sändning.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e7e2d7] bg-white p-6 space-y-6 shadow-xs">
      
      {/* Header & Deadline Notification Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#e7e2d7]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#d97706]" />
            <h4 className="text-base font-bold text-[#1c1917]">
              Momsdeklaration (Skatteverket SKV 4700)
            </h4>
          </div>
          <p className="text-xs text-stone-500">
            Officiellt sammanställt underlag enligt Mervärdesskattelagen baserat på dina godkända fakturor och kvitton.
          </p>
        </div>

        {/* Skatteverket Deadline Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#b45309]" />
            <span className="text-stone-600 font-medium">Nästa deklaration:</span>
            <strong className="text-[#1c1917] font-semibold">{deadlineInfo.formattedDeadline}</strong>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-[#b45309] font-bold">
              {deadlineInfo.daysLeft} dagar kvar
            </span>
          </div>

          {status === 'to_pay' ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-[#b45309] border border-amber-200">
              Att inbetala: {formatSEK(netMoms)}
            </span>
          ) : status === 'refund' ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-[#15803d] border border-emerald-200">
              Återbetalning: {formatSEK(Math.abs(netMoms))}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
              I balans (0 kr)
            </span>
          )}
        </div>
      </div>

      {/* Action Row: Email Reminder & Skatteverket Quick Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7]">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Sparkles className="w-4 h-4 text-[#d97706] shrink-0" />
          <span>Få momsrapporten med OCR och rutor levererad till din inkorg:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenDeclaration && (
            <button
              onClick={onOpenDeclaration}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-[#e7e2d7] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
              <span>Granska rutor (SKV 4700)</span>
            </button>
          )}

          {onOpenPayMoms && (
            <button
              onClick={onOpenPayMoms}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-[#e7e2d7] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-stone-500" />
              <span>Inbetalningsuppgifter & OCR</span>
            </button>
          )}

          <button
            onClick={handleSendEmailReminder}
            disabled={isSendingEmail}
            className="px-3.5 py-1.5 rounded-lg bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f59e0b]" />
                <span>Skickar...</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Skicka momsunderlag till e-post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Email Status Banner */}
      {emailStatus && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            emailStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {emailStatus.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{emailStatus.message}</span>
        </div>
      )}

      {/* Top 3 Metric Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Utgående moms */}
        <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-1.5">
          <div className="flex items-center justify-between text-sm text-stone-700">
            <span className="font-semibold">Utgående moms (Försäljning)</span>
            <ArrowUpRight className="w-4 h-4 text-[#d97706]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1c1917] tabular-nums">
            {formatSEK(utgaendeMoms)}
          </div>
          <span className="text-xs text-stone-500 block">Moms uppburen från kunder</span>
        </div>

        {/* Ingående moms */}
        <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-1.5">
          <div className="flex items-center justify-between text-sm text-stone-700">
            <span className="font-semibold">Ingående moms (Kvitton)</span>
            <ArrowDownLeft className="w-4 h-4 text-[#15803d]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#15803d] tabular-nums">
            -{formatSEK(ingaendeMoms)}
          </div>
          <span className="text-xs text-stone-500 block">Avdragsgill skatt på utgifter (Ruta 48)</span>
        </div>

        {/* Netto */}
        <div className="p-4 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-1.5">
          <div className="flex items-center justify-between text-sm text-stone-700">
            <span className="font-semibold">Att avräkna Skatteverket</span>
            <span className="text-xs font-mono text-[#b45309] font-bold">Ruta 49</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1c1917] tabular-nums">
            {formatSEK(Math.max(0, netMoms))}
          </div>
          <span className="text-xs text-stone-500 block">Reserverat på skattekontot</span>
        </div>

      </div>

      {/* Skatteverkets Rutor Breakdown */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Underlag per momssats & Skatteverkets Rutor
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          
          {/* 25% */}
          <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1c1917]">25% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 font-mono font-semibold border border-[#e7e2d7]">
                Ruta 05
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Underlag:</span>
                <span className="text-stone-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[25]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Skatt (Ruta 10):</span>
                <span className="text-[#1c1917] font-bold tabular-nums">{formatSEK(utgaendeBreakdown[25]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 12% */}
          <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1c1917]">12% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 font-mono font-semibold border border-[#e7e2d7]">
                Ruta 06
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Underlag:</span>
                <span className="text-stone-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[12]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Skatt (Ruta 11):</span>
                <span className="text-[#1c1917] font-bold tabular-nums">{formatSEK(utgaendeBreakdown[12]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 6% */}
          <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1c1917]">6% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 font-mono font-semibold border border-[#e7e2d7]">
                Ruta 07
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Underlag:</span>
                <span className="text-stone-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[6]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Skatt (Ruta 12):</span>
                <span className="text-[#1c1917] font-bold tabular-nums">{formatSEK(utgaendeBreakdown[6]?.vatAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 0% */}
          <div className="p-3.5 rounded-xl bg-white border border-[#e7e2d7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1c1917]">0% Moms</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 font-mono font-semibold border border-[#e7e2d7]">
                Momsfritt
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Underlag:</span>
                <span className="text-stone-800 font-semibold tabular-nums">{formatSEK(utgaendeBreakdown[0]?.netBase || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Skatt:</span>
                <span className="text-[#1c1917] font-bold tabular-nums">0 kr</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
