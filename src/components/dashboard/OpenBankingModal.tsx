'use client';

import React, { useState } from 'react';
import { SWEDISH_BANKS, SwedishBank, ConnectedBankAccount, PSD2Transaction } from '@/lib/open-banking/types';
import { formatSEK } from '@/lib/utils';
import { 
  Landmark, 
  ShieldCheck, 
  X, 
  Loader2, 
  Smartphone,
  CheckCircle2
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-zinc-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900">Anslut Företagskonto</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  PSD2 / Tink API
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Automatisk avstämning av inkommande betalningar och utgifter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Step: BankID Animation */}
        {authStep === 'bankid' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 mx-auto flex items-center justify-center text-zinc-800 animate-pulse">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900">Öppna Mobilt BankID</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Verifierar anslutning mot <strong>{selectedBank.name}</strong> för säker läsbehörighet...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-800" />
              <span>Väntar på signering...</span>
            </div>
          </div>
        )}

        {/* Auth Step: Success */}
        {authStep === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900">Bankkonto Anslutet</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Ditt företagskonto hos <strong>{selectedBank.name}</strong> är anslutet och synkat.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition shadow-xs"
            >
              Gå till bankavstämning
            </button>
          </div>
        )}

        {/* Auth Step: Select Bank */}
        {authStep === 'select' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center gap-2 text-zinc-600 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>Reglerat enligt Finansinspektionens PSD2-direktiv. Klaro har endast läsbehörighet.</span>
            </div>

            <div className="space-y-2">
              <span className="text-zinc-600 font-semibold block">Välj din svenska bank:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SWEDISH_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleStartConnect(bank)}
                    className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-900 text-xs">
                        {bank.name}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        BIC: {bank.bic}
                      </span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-zinc-800 transition" />
                  </button>
                ))}
              </div>
            </div>

            {connectedAccount && (
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-[11px] text-zinc-500 block">Nuvarande anslutet konto:</span>
                <div className="font-bold text-zinc-900">{connectedAccount.bankName}</div>
                <div className="font-mono text-zinc-600 text-[11px]">{connectedAccount.accountNumber} • Saldo: {formatSEK(connectedAccount.balance)}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {authStep === 'select' && (
          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition border border-zinc-200"
            >
              Stäng
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
