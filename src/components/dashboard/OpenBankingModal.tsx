'use client';

import React, { useState, useEffect } from 'react';
import { SWEDISH_BANKS, SwedishBank, ConnectedBankAccount, PSD2Transaction } from '@/lib/open-banking/types';
import { formatSEK } from '@/lib/utils';
import { 
  Landmark, 
  ShieldCheck, 
  X, 
  Loader2, 
  Smartphone,
  CheckCircle2,
  Key,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles
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
  
  // Tink live configuration state
  const [isLiveConfigured, setIsLiveConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/open-banking/callback` 
    : 'https://klaro-sepia.vercel.app/api/open-banking/callback';

  // Load Tink configuration status on open
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/open-banking/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data.isLiveConfigured) {
          setIsLiveConfigured(true);
        }
        if (data.clientId) {
          setClientId(data.clientId);
        }
      })
      .catch((err) => console.warn('Note on Tink config check:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveTinkCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) return;

    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/open-banking/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          environment: 'sandbox', // or live
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLiveConfigured(true);
        setConfigSuccess(true);
        setTimeout(() => {
          setConfigSuccess(false);
          setShowConfig(false);
        }, 1200);
      } else {
        alert(data.error || 'Kunde inte spara Tink-uppgifter.');
      }
    } catch (err: any) {
      alert(err.message || 'Fel vid sparning av Tink-uppgifter.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleStartConnect = async (bank: SwedishBank) => {
    setSelectedBank(bank);
    setIsAuthorizing(true);
    setAuthStep('bankid');

    try {
      const res = await fetch('/api/open-banking/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bankId: bank.id,
          redirectUri 
        }),
      });
      const data = await res.json();

      // If real live Tink is configured, redirect to Tink Link
      if (data.mode === 'live_tink' && data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }

      // Simulated sandbox connection with real bank transactions
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
      }, 1600);
    } catch (err) {
      setIsAuthorizing(false);
      setAuthStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#e7e2d7] rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-200 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c1917]/5 border border-[#1c1917]/10 flex items-center justify-center text-[#d97706]">
              <Landmark className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1c1917]">Anslut Bankkonto</h3>
                {isLiveConfigured ? (
                  <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#15803d] border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse" />
                    <span>Tink Live</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#f7f4ee] text-stone-700 border border-[#e7e2d7]">
                    Tink Sandbox
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Säker automatisk bankkoppling och kontoutdrag via PSD2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-[#f7f4ee] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Step: BankID Animation */}
        {authStep === 'bankid' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] mx-auto flex items-center justify-center text-[#1c1917] animate-pulse">
              <Smartphone className="w-6 h-6 text-[#d97706]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1c1917]">Öppna Mobilt BankID</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Verifierar anslutning mot <strong>{selectedBank.name}</strong> för säker läsbehörighet...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-stone-500 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
              <span>Väntar på signering...</span>
            </div>
          </div>
        )}

        {/* Auth Step: Success */}
        {authStep === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-[#15803d]">
              <CheckCircle2 className="w-6 h-6 text-[#15803d]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1c1917]">Bankkonto Anslutet</h4>
              <p className="text-xs text-stone-500 mt-1">
                Ditt företagskonto hos <strong>{selectedBank.name}</strong> är anslutet och synkat.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-xs transition shadow-xs cursor-pointer active:scale-95"
            >
              Gå till bankavstämning
            </button>
          </div>
        )}

        {/* Auth Step: Select Bank & Tink Config */}
        {authStep === 'select' && (
          <div className="space-y-4 text-xs">
            
            {/* Regulatory Notice Banner */}
            <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center gap-2 text-stone-600 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#d97706] shrink-0" />
              <span>Reglerat enligt Finansinspektionens PSD2-direktiv. Klaro har endast läsbehörighet för kontoutdrag och saldo.</span>
            </div>

            {/* Bank Grid */}
            <div className="space-y-2">
              <span className="text-stone-700 font-semibold block">Välj din svenska bank:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SWEDISH_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleStartConnect(bank)}
                    className="p-3 rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] hover:bg-[#eee8dc] hover:border-stone-400 transition text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-[#1c1917] text-xs">
                        {bank.name}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        BIC: {bank.bic}
                      </span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-stone-300 group-hover:bg-[#d97706] transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tink API Credentials Expander */}
            <div className="border border-[#e7e2d7] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="w-full p-3 bg-[#f7f4ee] hover:bg-[#eee8dc] text-left flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-[#d97706]" />
                  <span className="font-semibold text-stone-800 text-xs">
                    {isLiveConfigured ? 'Tink API-uppgifter (Konfigurerat)' : 'Har du ett Tink-konto? (Koppla på riktigt)'}
                  </span>
                </div>
                {showConfig ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                )}
              </button>

              {showConfig && (
                <form onSubmit={handleSaveTinkCredentials} className="p-4 space-y-3 bg-white text-xs border-t border-[#e7e2d7]">
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Kopiera ditt <strong>Client ID</strong> och <strong>Client Secret</strong> från ditt konto på{' '}
                    <a 
                      href="https://console.tink.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#b45309] font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      console.tink.com
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>.
                  </p>

                  {/* Callback URL to enter in Tink */}
                  <div className="bg-[#f7f4ee] p-2.5 rounded-lg border border-[#e7e2d7] space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      1. Ange denna Redirect URI i Tink Console:
                    </span>
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#1c1917] bg-white p-1.5 rounded border border-[#e7e2d7]">
                      <span className="truncate">{redirectUri}</span>
                      <button
                        type="button"
                        onClick={handleCopyRedirect}
                        className="text-stone-500 hover:text-[#1c1917] shrink-0 p-1"
                        title="Kopiera länk"
                      >
                        {copiedRedirect ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Client ID */}
                  <div>
                    <label className="text-stone-700 font-semibold block mb-1 text-[11px]">
                      2. Tink Client ID
                    </label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="t.ex. a1b2c3d4e5f6..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono text-xs focus:outline-none focus:border-[#1c1917]"
                      required
                    />
                  </div>

                  {/* Client Secret */}
                  <div>
                    <label className="text-stone-700 font-semibold block mb-1 text-[11px]">
                      3. Tink Client Secret
                    </label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="••••••••••••••••••••••••"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#e7e2d7] text-[#1c1917] font-mono text-xs focus:outline-none focus:border-[#1c1917]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="w-full py-2 px-3 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingConfig ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
                    ) : configSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sparat i Neon & aktiverat!</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span>Spara & Aktivera Tink API</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {connectedAccount && (
              <div className="p-3 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-1">
                <span className="text-[11px] text-stone-500 block">Nuvarande anslutet konto:</span>
                <div className="font-bold text-[#1c1917]">{connectedAccount.bankName}</div>
                <div className="font-mono text-stone-600 text-[11px]">
                  {connectedAccount.accountNumber} • Saldo: {formatSEK(connectedAccount.balance)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {authStep === 'select' && (
          <div className="flex justify-end pt-2 border-t border-[#e7e2d7]">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-800 text-xs font-semibold transition border border-[#e7e2d7] cursor-pointer"
            >
              Stäng
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
