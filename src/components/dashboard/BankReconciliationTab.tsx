'use client';

import React, { useState } from 'react';
import { PSD2Transaction, ConnectedBankAccount } from '@/lib/open-banking/types';
import { formatSEK, formatDate } from '@/lib/utils';
import { 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  RefreshCw, 
  Link2
} from 'lucide-react';

interface BankReconciliationTabProps {
  transactions: PSD2Transaction[];
  connectedAccount: ConnectedBankAccount | null;
  onOpenUpload: () => void;
  onOpenConnectBank: () => void;
  onSyncTransactions: () => Promise<void>;
}

export function BankReconciliationTab({
  transactions,
  connectedAccount,
  onOpenUpload,
  onOpenConnectBank,
  onSyncTransactions,
}: BankReconciliationTabProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const reconciledCount = transactions.filter((t) => t.reconciliationStatus === 'reconciled').length;
  const missingCount = transactions.filter((t) => t.reconciliationStatus === 'missing_receipt').length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncTransactions();
    } finally {
      setIsSyncing(false);
    }
  };

  const accountName = connectedAccount?.bankName || 'Handelsbanken Företagskonto';
  const iban = connectedAccount?.iban || 'SE45 6000 0000 0001 2345 6789';
  const balance = connectedAccount?.balance ?? 154285.00;

  return (
    <div className="space-y-4">
      
      {/* Top Banner: Open Banking Connection Info */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-zinc-900">{accountName}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                PSD2 Aktiv
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              IBAN: {iban} • Saldo: <span className="text-zinc-950 font-bold tabular-nums">{formatSEK(balance)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-zinc-500 block">Avstämning:</span>
            <span className="font-semibold text-zinc-800">
              {reconciledCount} av {transactions.length} poster godkända
            </span>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            title="Hämta senaste transaktioner via PSD2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-zinc-600' : 'text-zinc-400'}`} />
            <span>{isSyncing ? 'Synkar...' : 'Synka feed'}</span>
          </button>

          <button
            onClick={onOpenConnectBank}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition shadow-2xs"
          >
            Byt bank
          </button>
        </div>
      </div>

      {/* Warning callout if missing receipts exist */}
      {missingCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-950">
                {missingCount} transaktioner saknar verifikat eller kvitto
              </strong>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Varje affärshändelse ska styrkas med verifikat för att momsavdraget ska godkännas vid revision.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition shrink-0 flex items-center gap-1 text-xs shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ladda upp kvitto</span>
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Bokföringsdatum</th>
                <th className="py-2.5 px-4 font-semibold">Transaktionsbeskrivning</th>
                <th className="py-2.5 px-4 font-semibold text-right">Belopp (SEK)</th>
                <th className="py-2.5 px-4 font-semibold">Avstämningsstatus</th>
                <th className="py-2.5 px-4 font-semibold text-right">Kopplat Verifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-600 text-[11px]">
                    {formatDate(tx.bookingDate)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    <div>{tx.description}</div>
                    {tx.merchantName && (
                      <span className="text-[10px] text-zinc-500 font-normal block">
                        Handlare: {tx.merchantName}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-zinc-950 tabular-nums">
                    {tx.amount > 0 ? `+${formatSEK(tx.amount)}` : formatSEK(tx.amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {tx.reconciliationStatus === 'reconciled' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Matchad
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Kvitto saknas
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    {tx.reconciliationStatus === 'missing_receipt' ? (
                      <button
                        onClick={onOpenUpload}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold transition border border-zinc-200 shadow-2xs"
                      >
                        Koppla kvitto
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-mono flex items-center justify-end gap-1">
                        <Link2 className="w-3 h-3 text-zinc-400" />
                        <span>{tx.matchedInvoiceId || tx.matchedReceiptId || 'Verifikat'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
