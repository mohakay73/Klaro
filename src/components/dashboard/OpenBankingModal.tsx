'use client';

import React, { useState } from 'react';
import { SWEDISH_BANKS, SwedishBank, ConnectedBankAccount, PSD2Transaction } from '@/lib/open-banking/types';
import { formatSEK } from '@/lib/utils';
import { 
  Landmark, 
  ShieldCheck, 
  Check, 
  ExternalLink, 
  X, 
  Loader2, 
  RefreshCw, 
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface OpenBankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccount: ConnectedBankAccount | null;
  onConnectAccount: (account: ConnectedBankAccount, transactions: PSD2Transaction[]) => void;
}

export function OpenBankingModal({
  isOpen,
  onClose,
  connectedAccount,
  onConnectAccount,
}: OpenBankingModalProps) {
  const [selectedBank, setSelectedBank] = useState<SwedishBank>(SWEDISH_BANKS[0]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState<'select' | 'bankid' | 'success'>('select');

  if (!isOpen) return null;

  const handleStartConnect = async (bank: SwedishBank) => {
    setSelectedBank(bank);
    setIsAuthorizing(true);
    setAuthStep('bankid');

    // Simulate Mobilt BankID verification / Tink Link authorization
    try {
      const res = await fetch('/api/open-banking/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId: bank.id }),
      });
      const data = await res.json();

      if (data.mode === 'live_tink' && data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }

      // In sandbox mode: simulate 1.5s BankID approval
      setTimeout(async () => {
        const syncRes = await fetch('/api/open-banking/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: `acc-${bank.id}-main` }),
        });
        const syncData = await syncRes.json();

        const account: ConnectedBankAccount = data.accounts?.[0] || {
          id: `acc-${bank.id}-main`,
          bankId: bank.id,
          bankName: `${bank.name} Företagskonto`,
          accountNumber: `${bank.clearingNumberExample}-892 419 012`,
          iban: 'SE45 6000 0000 0001 2345 6789',
          currency: 'SEK',
          balance: 154285.00,
          lastSyncedAt: new Date().toISOString(),
          status: 'active',
        };

        setAuthStep('success');
        setIsAuthorizing(false);
        onConnectAccount(account, syncData.transactions || []);
      }, 1500);
    } catch (err) {
      setIsAuthorizing(false);
      setAuthStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Anslut Svenskt Företagskonto</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  PSD2 / Tink API
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Automatisk avstämning av inkommande fakturor och kvittoköp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Step: BankID Animation */}
        {authStep === 'bankid' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 mx-auto flex items-center justify-center text-sky-400 animate-pulse">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Öppna Mobilt BankID</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Verifierar anslutning mot <strong>{selectedBank.name}</strong> för automatisk transaktionshämtning...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-sky-400 font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Väntar på signering...</span>
            </div>
          </div>
        )}

        {/* Auth Step: Success */}
        {authStep === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Bankkonto Anslutet!</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Ditt företagskonto hos <strong>{selectedBank.name}</strong> är nu synkat. Transaktioner stäms av automatiskt.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
            >
              Gå till bankavstämning
            </button>
          </div>
        )}

        {/* Auth Step: Select Bank */}
        {authStep === 'select' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reglerad enligt Finansinspektionens PSD2-direktiv. Klaro har endast läsbehörighet till transaktioner.</span>
            </div>

            <div className="space-y-2">
              <span className="text-zinc-400 font-medium block">Välj din svenska bank:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SWEDISH_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleStartConnect(bank)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:border-zinc-700 transition text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-zinc-200 group-hover:text-white text-xs">
                        {bank.name}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        BIC: {bank.bic}
                      </span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 group-hover:bg-sky-400 transition" />
                  </button>
                ))}
              </div>
            </div>

            {connectedAccount && (
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-500">Nuvarande anslutet konto:</span>
                <div className="font-medium text-zinc-200">{connectedAccount.bankName}</div>
                <div className="font-mono text-zinc-400 text-[11px]">{connectedAccount.accountNumber} • Saldo: {formatSEK(connectedAccount.balance)}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {authStep === 'select' && (
          <div className="flex justify-end pt-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              Stäng
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
