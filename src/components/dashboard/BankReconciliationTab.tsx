'use client';

import React, { useState, useMemo } from 'react';
import { PSD2Transaction, ConnectedBankAccount, ReconciliationStatus } from '@/lib/open-banking/types';
import { Receipt, Invoice, SwedishVatRate, CompanyType } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { calculateTaxDeductionLoss } from '@/lib/open-banking/reconciliation-engine';
import { 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  RefreshCw, 
  Link2,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  FileText,
  Plus,
  Sparkles,
  Info,
  X,
  Building2,
  Receipt as ReceiptIcon,
  HelpCircle,
  TrendingDown,
  ShieldAlert,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

interface BankReconciliationTabProps {
  transactions: PSD2Transaction[];
  connectedAccount: ConnectedBankAccount | null;
  receipts?: Receipt[];
  invoices?: Invoice[];
  companyType?: CompanyType;
  onOpenUpload: () => void;
  onOpenConnectBank: () => void;
  onSyncTransactions: () => Promise<void>;
  onUpdateTransaction?: (updatedTx: PSD2Transaction) => void;
  onLinkReceiptToTransaction?: (txId: string, receipt: Receipt) => void;
  onAddReceipt?: (receipt: Receipt) => void;
}

type FilterStatus = 'ALL' | 'MISSING' | 'RECONCILED' | 'PRIVATE' | 'INCOME';

export function BankReconciliationTab({
  transactions,
  connectedAccount,
  receipts = [],
  invoices = [],
  companyType = 'enskild_firma',
  onOpenUpload,
  onOpenConnectBank,
  onSyncTransactions,
  onUpdateTransaction,
  onLinkReceiptToTransaction,
  onAddReceipt,
}: BankReconciliationTabProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedTxForLink, setSelectedTxForLink] = useState<PSD2Transaction | null>(null);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<PSD2Transaction | null>(null);

  // Quick Receipt Creator State inside the link modal
  const [quickVatRate, setQuickVatRate] = useState<SwedishVatRate>(25);
  const [quickCategory, setQuickCategory] = useState('Programvaror & Molntjänster');

  // Stats & Tax Loss
  const taxLoss = useMemo(() => calculateTaxDeductionLoss(transactions), [transactions]);
  const reconciledCount = transactions.filter((t) => t.reconciliationStatus === 'reconciled').length;
  const missingCount = transactions.filter((t) => t.reconciliationStatus === 'missing_receipt').length;
  const privateCount = transactions.filter((t) => t.reconciliationStatus === 'private_draw').length;
  const incomeCount = transactions.filter((t) => t.amount > 0).length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncTransactions();
    } finally {
      setIsSyncing(false);
    }
  };

  // One-click Toggle "Eget Uttag / Privat"
  const handleTogglePrivateDraw = (tx: PSD2Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateTransaction) return;

    if (tx.reconciliationStatus === 'private_draw') {
      // Revert to missing receipt
      onUpdateTransaction({
        ...tx,
        reconciliationStatus: 'missing_receipt',
        basAccount: undefined,
        note: undefined,
      });
    } else {
      // Mark as private draw
      const basAccount = companyType === 'aktiebolag' ? '2893' : '2013';
      onUpdateTransaction({
        ...tx,
        reconciliationStatus: 'private_draw',
        basAccount,
        note: companyType === 'aktiebolag' 
          ? 'Avräkning ägare / privat utlägg' 
          : 'Eget uttag (Enskild firma) - påverkar ej resultatet',
      });
    }
  };

  // Quick Create Receipt and Match directly
  const handleCreateAndMatchReceipt = (tx: PSD2Transaction) => {
    const absTotal = Math.abs(tx.amount);
    const vatFraction = quickVatRate > 0 ? quickVatRate / (100 + quickVatRate) : 0;
    const vatAmount = Math.round(absTotal * vatFraction * 100) / 100;

    const newReceipt: Receipt = {
      id: `rec-quick-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      original_file_url: null,
      source_type: 'web_upload',
      vendor_name: tx.merchantName || tx.description.replace(/^Kortköp\s+|^Klarna Bankgiro utb:\s+/, ''),
      invoice_date: tx.bookingDate,
      currency: 'SEK',
      total_amount: absTotal,
      vat_amount: vatAmount,
      vat_rate: quickVatRate,
      category: quickCategory,
      raw_ai_response: {
        bas_account: tx.basAccount || '5420',
        reasoning: `Skapat via snabbavstämning för banktransaktion: ${tx.description}`,
      },
      status: 'verified',
      created_at: new Date().toISOString(),
    };

    if (onAddReceipt) {
      onAddReceipt(newReceipt);
    }

    if (onUpdateTransaction) {
      onUpdateTransaction({
        ...tx,
        reconciliationStatus: 'reconciled',
        matchedReceiptId: newReceipt.id,
        category: quickCategory,
      });
    }

    setSelectedTxForLink(null);
  };

  // Link existing receipt to transaction
  const handleLinkExistingReceipt = (tx: PSD2Transaction, receipt: Receipt) => {
    if (onUpdateTransaction) {
      onUpdateTransaction({
        ...tx,
        reconciliationStatus: 'reconciled',
        matchedReceiptId: receipt.id,
      });
    }
    if (onLinkReceiptToTransaction) {
      onLinkReceiptToTransaction(tx.id, receipt);
    }
    setSelectedTxForLink(null);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Status Filter
      if (statusFilter === 'MISSING' && tx.reconciliationStatus !== 'missing_receipt') return false;
      if (statusFilter === 'RECONCILED' && tx.reconciliationStatus !== 'reconciled') return false;
      if (statusFilter === 'PRIVATE' && tx.reconciliationStatus !== 'private_draw') return false;
      if (statusFilter === 'INCOME' && tx.amount <= 0) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const merchantMatch = (tx.merchantName || '').toLowerCase().includes(query);
        const refMatch = (tx.reference || '').toLowerCase().includes(query);
        const amountMatch = Math.abs(tx.amount).toString().includes(query);
        const accountMatch = (tx.basAccount || '').toLowerCase().includes(query);
        return descMatch || merchantMatch || refMatch || amountMatch || accountMatch;
      }

      return true;
    });
  }, [transactions, statusFilter, searchQuery]);

  const accountName = connectedAccount?.bankName || 'Handelsbanken Företagskonto';
  const iban = connectedAccount?.iban || 'SE45 6000 0000 0001 2345 6789';
  const balance = connectedAccount?.balance ?? 154285.00;

  return (
    <div className="space-y-6">
      
      {/* 1. Bank Account Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0c3123]/5 border border-[#0c3123]/15 flex items-center justify-center text-[#0c3123] shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-zinc-900 tracking-tight">{accountName}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  PSD2 Live Feed
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Handelsbanken API
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                IBAN: {iban} • Bokfört banksaldo: <span className="font-bold text-zinc-900 tabular-nums">{formatSEK(balance)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Hämta senaste transaktioner via PSD2 Open Banking"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${isSyncing ? 'animate-spin text-[#0c3123]' : ''}`} />
              <span>{isSyncing ? 'Synkroniserar...' : 'Synka bankfeed'}</span>
            </button>

            <button
              onClick={onOpenConnectBank}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              Byt bankkonto
            </button>
          </div>

        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-zinc-100">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-xs text-zinc-500 font-medium">Totalt transaktioner</span>
            <div className="text-lg font-bold text-zinc-900 tabular-nums mt-0.5">{transactions.length} st</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Avstämda poster
            </span>
            <div className="text-lg font-bold text-emerald-900 tabular-nums mt-0.5">{reconciledCount} st</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
            <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Saknar underlag
            </span>
            <div className="text-lg font-bold text-amber-900 tabular-nums mt-0.5">{missingCount} st</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <span className="text-xs text-purple-800 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              Eget uttag (Privat)
            </span>
            <div className="text-lg font-bold text-purple-900 tabular-nums mt-0.5">{privateCount} st</div>
          </div>
        </div>

      </div>

      {/* 2. Swedish Tax Deduction Loss Calculator Banner (Skatteavdragsrisk) */}
      {missingCount > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50/90 via-amber-50/50 to-orange-50/60 p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-amber-950">
                    Skatteavdragsrisk: {formatSEK(taxLoss.totalEstimatedLoss)} kan förloras
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    {taxLoss.missingCount} verifikat saknas
                  </span>
                </div>
                <p className="text-xs text-amber-800 max-w-2xl leading-relaxed">
                  Enligt <strong>Bokföringslagen (7 kap. BFL)</strong> medges ej avdrag för moms eller kostnad utan underlag. 
                  Av {formatSEK(taxLoss.totalMissingAmount)} i oredovisade köp riskerar du{' '}
                  <strong>{formatSEK(taxLoss.estimatedVatLoss)} i förlorad ingående moms</strong> samt{' '}
                  <strong>{formatSEK(taxLoss.estimatedIncomeTaxLoss)} i ökad inkomstskatt/egenavgifter</strong>.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-amber-700">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Momsavdrag (25%): <strong>{formatSEK(taxLoss.estimatedVatLoss)}</strong>
                  </span>
                  <span className="text-amber-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Resultatavdrag (~43%): <strong>{formatSEK(taxLoss.estimatedIncomeTaxLoss)}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                onClick={() => setStatusFilter('MISSING')}
                className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <span>Visa saknade kvitton ({missingCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950">Alla transaktioner är fullständigt avstämda</h4>
              <p className="text-xs text-emerald-800">Inga saknade kvitton. Ditt moms- och skatteavdrag är 100% säkrat.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
            0 kr i skatterisk
          </span>
        </div>
      )}

      {/* 3. Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-zinc-200 shadow-2xs overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-[#0c3123] text-white shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Alla ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter('MISSING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'MISSING'
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Saknar kvitto ({missingCount})
          </button>
          <button
            onClick={() => setStatusFilter('RECONCILED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'RECONCILED'
                ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Avstämda ({reconciledCount})
          </button>
          <button
            onClick={() => setStatusFilter('PRIVATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'PRIVATE'
                ? 'bg-purple-700 text-white shadow-2xs font-semibold'
                : 'text-purple-800 hover:bg-purple-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Eget uttag ({privateCount})
          </button>
          <button
            onClick={() => setStatusFilter('INCOME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'INCOME'
                ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Inbetalningar ({incomeCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök handlare, belopp, konto..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c3123]/20 focus:border-[#0c3123] transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

      </div>

      {/* 4. Transactions List (Responsive: Mobile Cards + Desktop Table) */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
        
        {/* Mobile Touch Cards (< 768px) */}
        <div className="md:hidden divide-y divide-zinc-200/80">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Inga transaktioner matchar det valda filtret.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isExpense = tx.amount < 0;
              const absAmount = Math.abs(tx.amount);
              const isMissing = tx.reconciliationStatus === 'missing_receipt';
              const isPrivate = tx.reconciliationStatus === 'private_draw';
              const isReconciled = tx.reconciliationStatus === 'reconciled';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxForDetails(tx)}
                  className="p-4 space-y-3 bg-white hover:bg-[#fcfbf9] active:bg-zinc-100/50 transition cursor-pointer"
                >
                  {/* Top: Icon + Description + Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isExpense 
                          ? 'bg-zinc-100 text-zinc-600' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isExpense ? (
                          <ArrowDownLeft className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-950 truncate">{tx.description}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mt-0.5">
                          <span>{formatDate(tx.bookingDate)}</span>
                          <span>•</span>
                          <span className="font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                            BAS {tx.basAccount || (isExpense ? '6990' : '1510')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm tabular-nums block ${
                        tx.amount > 0 ? 'text-emerald-700' : 'text-zinc-950'
                      }`}>
                        {tx.amount > 0 ? `+${formatSEK(tx.amount)}` : `-${formatSEK(absAmount)}`}
                      </span>
                    </div>
                  </div>

                  {/* Status & Category Strip */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-zinc-500 truncate max-w-[180px]">
                      {tx.merchantName || tx.category || 'Bankhändelse'}
                    </span>
                    <div>
                      {isReconciled && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Avstämd
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Saknar kvitto
                        </span>
                      )}
                      {isPrivate && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          <UserCheck className="w-3 h-3 text-purple-600" />
                          Eget uttag (2013)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedTxForDetails(tx)}
                      className="text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 text-[11px]"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Visa kontering</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isMissing && (
                        <>
                          <button
                            onClick={() => setSelectedTxForLink(tx)}
                            className="px-3 py-1.5 rounded-lg bg-[#0c3123] text-white text-xs font-semibold shadow-xs active:scale-95 transition flex items-center gap-1"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Koppla kvitto</span>
                          </button>
                          <button
                            onClick={(e) => handleTogglePrivateDraw(tx, e)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition"
                          >
                            Privat
                          </button>
                        </>
                      )}
                      {isPrivate && (
                        <button
                          onClick={(e) => handleTogglePrivateDraw(tx, e)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition"
                        >
                          Ångra uttag
                        </button>
                      )}
                      {isReconciled && (
                        <span className="font-mono text-[11px] text-zinc-500 flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-zinc-400" />
                          <span>{tx.matchedInvoiceId || tx.matchedReceiptId || 'Verifikat'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-zinc-600 border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-zinc-500">Bokfört</th>
                <th className="py-3 px-4 font-semibold text-zinc-700">Beskrivning & Handlare</th>
                <th className="py-3 px-4 font-semibold text-zinc-500">Konto (BAS)</th>
                <th className="py-3 px-4 font-semibold text-right text-zinc-700">Belopp</th>
                <th className="py-3 px-4 font-semibold text-zinc-700">Status</th>
                <th className="py-3 px-4 font-semibold text-right text-zinc-700">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Inga transaktioner matchar det valda filtret.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isExpense = tx.amount < 0;
                  const absAmount = Math.abs(tx.amount);
                  const isMissing = tx.reconciliationStatus === 'missing_receipt';
                  const isPrivate = tx.reconciliationStatus === 'private_draw';
                  const isReconciled = tx.reconciliationStatus === 'reconciled';

                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTxForDetails(tx)}
                      className="hover:bg-[#fcfbf9] transition cursor-pointer group"
                    >
                      {/* 1. Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-500 text-[11px]">
                        {formatDate(tx.bookingDate)}
                      </td>

                      {/* 2. Merchant & Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isExpense 
                              ? 'bg-zinc-100 text-zinc-600' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isExpense ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-zinc-500" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </span>
                          <div>
                            <div className="font-semibold text-zinc-900 group-hover:text-[#0c3123] transition flex items-center gap-2">
                              <span>{tx.description}</span>
                              {tx.reference && (
                                <span className="font-mono text-[10px] text-zinc-400 font-normal">
                                  ref: {tx.reference}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                              {tx.merchantName && (
                                <span className="font-medium text-zinc-700">{tx.merchantName}</span>
                              )}
                              {tx.category && (
                                <>
                                  <span className="text-zinc-300">•</span>
                                  <span>{tx.category}</span>
                                </>
                              )}
                              {tx.note && (
                                <>
                                  <span className="text-zinc-300">•</span>
                                  <span className="text-purple-700 font-medium">{tx.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. BAS Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {tx.basAccount || (isExpense ? '6990' : '1510')}
                        </span>
                      </td>

                      {/* 4. Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-sm tabular-nums">
                        {tx.amount > 0 ? (
                          <span className="text-emerald-700">+{formatSEK(tx.amount)}</span>
                        ) : (
                          <span className="text-zinc-950">-{formatSEK(absAmount)}</span>
                        )}
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isReconciled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Avstämd
                          </span>
                        )}
                        {isMissing && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Kvitto saknas
                          </span>
                        )}
                        {isPrivate && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                            Eget uttag (2013)
                          </span>
                        )}
                        {tx.reconciliationStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                            Väntar
                          </span>
                        )}
                      </td>

                      {/* 6. Contextual Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        {isMissing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTxForLink(tx)}
                              className="px-2.5 py-1 rounded-lg bg-[#0c3123] hover:bg-[#144734] text-white text-[11px] font-semibold transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Koppla eller generera kvitto för denna transaktion"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Koppla kvitto</span>
                            </button>

                            <button
                              onClick={(e) => handleTogglePrivateDraw(tx, e)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200 transition shadow-2xs cursor-pointer active:scale-95"
                              title="Markera som eget uttag (privat inköp) så behövs inget företagskvitto"
                            >
                              Privat
                            </button>
                          </div>
                        ) : isPrivate ? (
                          <button
                            onClick={(e) => handleTogglePrivateDraw(tx, e)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600 text-[11px] font-medium border border-zinc-200 transition shadow-2xs cursor-pointer active:scale-95"
                            title="Återställ till saknar kvitto"
                          >
                            Ångra uttag
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1 font-mono text-[11px] text-zinc-500">
                            <Link2 className="w-3 h-3 text-zinc-400" />
                            <span>{tx.matchedInvoiceId || tx.matchedReceiptId || 'Verifikat'}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Connect or Quick Create Receipt for Transaction (Mobile Bottom Sheet) */}
      {selectedTxForLink && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-200 mx-auto -mt-2 mb-2 sm:hidden" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0c3123]/10 border border-[#0c3123]/20 flex items-center justify-center text-[#0c3123]">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Koppla underlag till banktransaktion</h3>
                  <p className="text-xs text-zinc-500">Säkra momsavdraget enligt Bokföringslagen</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxForLink(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Transaction Summary Card */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Vald transaktion</span>
                <span className="font-bold text-xs text-zinc-900 block mt-0.5">{selectedTxForLink.description}</span>
                <span className="text-[11px] text-zinc-500">{formatDate(selectedTxForLink.bookingDate)}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-zinc-950 block">
                  {formatSEK(Math.abs(selectedTxForLink.amount))}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">SEK</span>
              </div>
            </div>

            {/* Option A: Quick Generate Digital Verifikat */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-xs text-emerald-950">Skapa verifikat direkt (1-klick)</h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Rekommenderat
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-zinc-600 block mb-1">Momsats</label>
                  <select
                    value={quickVatRate}
                    onChange={(e) => setQuickVatRate(Number(e.target.value) as SwedishVatRate)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0c3123]"
                  >
                    <option value={25}>25% Moms (Standard, IT, Konsult)</option>
                    <option value={12}>12% Moms (Mat, Hotell)</option>
                    <option value={6}>6% Moms (Tåg, Taxi, Böcker)</option>
                    <option value={0}>0% Moms (Momsfritt, Finansiellt)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-600 block mb-1">Kategori</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0c3123]"
                  >
                    <option value="Programvaror & Molntjänster">Programvaror (BAS 5420)</option>
                    <option value="Persontransport (Tåg, Taxi, Flyg)">Resor & Transport (BAS 5800)</option>
                    <option value="Kontorsmaterial & Datatillbehör">Kontor & Hårdvara (BAS 5410)</option>
                    <option value="Måltider & Representation">Representation (BAS 6072)</option>
                    <option value="Bankavgifter & Finansiella Tjänster">Bankavgifter (BAS 6570)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleCreateAndMatchReceipt(selectedTxForLink)}
                className="w-full py-2.5 rounded-xl bg-[#0c3123] hover:bg-[#144734] text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Skapa verifikat & Avstäm transaktion</span>
              </button>
            </div>

            {/* Option B: Choose among existing receipts in Klaro */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-zinc-800">Eller välj bland befintliga kvitton</h4>
              <div className="max-h-40 overflow-y-auto divide-y divide-zinc-100 border border-zinc-200 rounded-xl bg-white">
                {receipts.length === 0 ? (
                  <p className="p-3 text-xs text-zinc-500 text-center">Inga kvitton sparade ännu.</p>
                ) : (
                  receipts.map((rec) => {
                    const isAmountMatch = Math.abs(rec.total_amount - Math.abs(selectedTxForLink.amount)) < 1.0;

                    return (
                      <div
                        key={rec.id}
                        onClick={() => handleLinkExistingReceipt(selectedTxForLink, rec)}
                        className={`p-2.5 flex items-center justify-between text-xs hover:bg-zinc-50 transition cursor-pointer ${
                          isAmountMatch ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-zinc-900 flex items-center gap-2">
                            <span>{rec.vendor_name}</span>
                            {isAmountMatch && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                Exakt belopp!
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500">{formatDate(rec.invoice_date)} • {rec.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-zinc-950 tabular-nums">{formatSEK(rec.total_amount)}</span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">Klicka för att koppla</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer / Alternate Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
              <button
                onClick={() => {
                  setSelectedTxForLink(null);
                  onOpenUpload();
                }}
                className="text-[#0c3123] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ladda upp kvittofil (PDF/JPG)</span>
              </button>

              <button
                onClick={(e) => {
                  handleTogglePrivateDraw(selectedTxForLink, e);
                  setSelectedTxForLink(null);
                }}
                className="text-purple-700 hover:underline font-semibold cursor-pointer"
              >
                Markera som eget uttag (privat)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Modal: Detailed Transaction Inspector & Double-Entry Journal (Mobile Bottom Sheet) */}
      {selectedTxForDetails && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-200 mx-auto -mt-2 mb-2 sm:hidden" />
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Transaktionsunderlag & Kontering</h3>
                  <p className="text-xs text-zinc-500 font-mono">PSD2 ID: {selectedTxForDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxForDetails(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PSD2 Raw Details */}
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Beskrivning:</span>
                  <span className="font-semibold text-zinc-900">{selectedTxForDetails.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Handlare / Motpart:</span>
                  <span className="font-semibold text-zinc-900">{selectedTxForDetails.merchantName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Bokföringsdatum:</span>
                  <span className="font-mono text-zinc-800">{formatDate(selectedTxForDetails.bookingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Belopp:</span>
                  <span className="font-mono font-bold text-zinc-950">{formatSEK(selectedTxForDetails.amount)}</span>
                </div>
                {selectedTxForDetails.reference && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Referens / OCR:</span>
                    <span className="font-mono text-zinc-800">{selectedTxForDetails.reference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Swedish Accounting Double-Entry Journal (BAS-Kontering) */}
            <div>
              <h4 className="font-bold text-xs text-zinc-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>Kontering enligt BAS-kontoplan</span>
              </h4>
              <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Konto</th>
                      <th className="py-2 px-3 font-semibold">Kontonamn</th>
                      <th className="py-2 px-3 font-semibold text-right">Debet</th>
                      <th className="py-2 px-3 font-semibold text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                    {selectedTxForDetails.amount > 0 ? (
                      // Incoming invoice payment
                      <>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">1930</td>
                          <td className="py-2 px-3 text-zinc-700">Företagskonto</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700 tabular-nums">
                            {formatSEK(selectedTxForDetails.amount)}
                          </td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">1510</td>
                          <td className="py-2 px-3 text-zinc-700">Kundfordringar</td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                          <td className="py-2 px-3 text-right font-bold text-zinc-900 tabular-nums">
                            {formatSEK(selectedTxForDetails.amount)}
                          </td>
                        </tr>
                      </>
                    ) : selectedTxForDetails.reconciliationStatus === 'private_draw' ? (
                      // Private draw / Eget uttag
                      <>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">{selectedTxForDetails.basAccount || '2013'}</td>
                          <td className="py-2 px-3 text-zinc-700">Eget uttag (Privat)</td>
                          <td className="py-2 px-3 text-right font-bold text-purple-700 tabular-nums">
                            {formatSEK(Math.abs(selectedTxForDetails.amount))}
                          </td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">1930</td>
                          <td className="py-2 px-3 text-zinc-700">Företagskonto</td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                          <td className="py-2 px-3 text-right font-bold text-zinc-900 tabular-nums">
                            {formatSEK(Math.abs(selectedTxForDetails.amount))}
                          </td>
                        </tr>
                      </>
                    ) : (
                      // Expense with receipt
                      <>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">{selectedTxForDetails.basAccount || '5420'}</td>
                          <td className="py-2 px-3 text-zinc-700">{selectedTxForDetails.category || 'Kostnad'}</td>
                          <td className="py-2 px-3 text-right font-bold text-zinc-900 tabular-nums">
                            {formatSEK(Math.abs(selectedTxForDetails.amount) * 0.8)}
                          </td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">2641</td>
                          <td className="py-2 px-3 text-zinc-700">Ingående moms (25%)</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700 tabular-nums">
                            {formatSEK(Math.abs(selectedTxForDetails.amount) * 0.2)}
                          </td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-900">1930</td>
                          <td className="py-2 px-3 text-zinc-700">Företagskonto</td>
                          <td className="py-2 px-3 text-right text-zinc-400">—</td>
                          <td className="py-2 px-3 text-right font-bold text-zinc-900 tabular-nums">
                            {formatSEK(Math.abs(selectedTxForDetails.amount))}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions inside inspector */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTxForDetails(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer transition"
              >
                Stäng
              </button>
              {selectedTxForDetails.reconciliationStatus === 'missing_receipt' && (
                <button
                  onClick={() => {
                    const tx = selectedTxForDetails;
                    setSelectedTxForDetails(null);
                    setSelectedTxForLink(tx);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0c3123] hover:bg-[#144734] text-white text-xs font-semibold cursor-pointer transition"
                >
                  Koppla kvitto nu
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
