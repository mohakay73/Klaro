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
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-zinc-100">{accountName}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                PSD2 Aktiv
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              IBAN: {iban} • Saldo: <span className="text-zinc-200 font-semibold tabular-nums">{formatSEK(balance)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-zinc-500 block">Avstämning:</span>
            <span className="font-medium text-zinc-300">
              {reconciledCount} av {transactions.length} poster godkända
            </span>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            title="Hämta senaste transaktioner via PSD2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-zinc-300' : 'text-zinc-400'}`} />
            <span>{isSyncing ? 'Synkar...' : 'Synka feed'}</span>
          </button>

          <button
            onClick={onOpenConnectBank}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
          >
            Byt bank
          </button>
        </div>
      </div>

      {/* Warning callout if missing receipts exist */}
      {missingCount > 0 && (
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start justify-between gap-3 text-xs text-zinc-300">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200">
                {missingCount} transaktioner saknar verifikat eller kvitto
              </strong>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Varje affärshändelse ska styrkas med verifikat för att momsavdraget ska godkännas vid revision.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition shrink-0 flex items-center gap-1 text-xs shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ladda upp kvitto</span>
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-medium">Bokföringsdatum</th>
                <th className="py-2.5 px-4 font-medium">Transaktionsbeskrivning</th>
                <th className="py-2.5 px-4 font-medium text-right">Belopp (SEK)</th>
                <th className="py-2.5 px-4 font-medium">Avstämningsstatus</th>
                <th className="py-2.5 px-4 font-medium text-right">Kopplat Verifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-400 text-[11px]">
                    {formatDate(tx.bookingDate)}
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-200">
                    <div>{tx.description}</div>
                    {tx.merchantName && (
                      <span className="text-[10px] text-zinc-500 block">
                        Handlare: {tx.merchantName}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-medium text-zinc-100 tabular-nums">
                    {tx.amount > 0 ? `+${formatSEK(tx.amount)}` : formatSEK(tx.amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {tx.reconciliationStatus === 'reconciled' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Matchad
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        Kvitto saknas
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    {tx.reconciliationStatus === 'missing_receipt' ? (
                      <button
                        onClick={onOpenUpload}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition border border-zinc-700/60"
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
