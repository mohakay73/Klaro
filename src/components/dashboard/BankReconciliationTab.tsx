'use client';

import React, { useState, useMemo } from 'react';
import { PSD2Transaction, ConnectedBankAccount, ReconciliationStatus } from '@/lib/open-banking/types';
import { Receipt, Invoice, SwedishVatRate, CompanyType } from '@/types/database';
import { formatSEK, formatDate } from '@/lib/utils';
import { calculateTaxDeductionLoss, reconcileTransactions } from '@/lib/open-banking/reconciliation-engine';
import { parseSwedishBankCsv } from '@/lib/open-banking/csv-importer';
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
  ExternalLink,
  Camera,
  Download
} from 'lucide-react';

interface BankReconciliationTabProps {
  transactions: PSD2Transaction[];
  connectedAccount: ConnectedBankAccount | null;
  receipts?: Receipt[];
  invoices?: Invoice[];
  companyType?: CompanyType;
  onOpenUpload: (mode?: 'default' | 'camera' | 'text') => void;
  onOpenConnectBank: () => void;
  onSyncTransactions: () => Promise<void>;
  onUpdateTransaction?: (updatedTx: PSD2Transaction) => void;
  onBatchUpdateTransactions?: (updatedTxs: PSD2Transaction[]) => void;
  onLinkReceiptToTransaction?: (txId: string, receipt: Receipt) => void;
  onAddReceipt?: (receipt: Receipt) => void;
  onClearBankData?: () => void;
  onImportCsvTransactions?: (txs: PSD2Transaction[], account?: ConnectedBankAccount) => void;
  onLoadDemoBankData?: () => void;
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
  onBatchUpdateTransactions,
  onLinkReceiptToTransaction,
  onAddReceipt,
  onClearBankData,
  onImportCsvTransactions,
  onLoadDemoBankData,
}: BankReconciliationTabProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [importNotification, setImportNotification] = useState<string | null>(null);
  
  // Modal states
  const [selectedTxForLink, setSelectedTxForLink] = useState<PSD2Transaction | null>(null);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<PSD2Transaction | null>(null);

  // Auto-Reconciliation Modal State
  const [autoReconcileModal, setAutoReconcileModal] = useState<{
    isOpen: boolean;
    result: any;
    newlyMatchedCount: number;
  } | null>(null);

  const handleRunAutoReconciliation = () => {
    const { reconciledTransactions, result } = reconcileTransactions(transactions, invoices, receipts);
    const prevReconciled = transactions.filter((t) => t.reconciliationStatus === 'reconciled').length;
    const newlyMatched = Math.max(0, result.reconciledCount - prevReconciled);

    if (onBatchUpdateTransactions) {
      onBatchUpdateTransactions(reconciledTransactions);
    } else if (onUpdateTransaction) {
      reconciledTransactions.forEach((tx) => onUpdateTransaction(tx));
    }

    setAutoReconcileModal({
      isOpen: true,
      result,
      newlyMatchedCount: newlyMatched,
    });
  };

  const handleUnlinkTransaction = (tx: PSD2Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateTransaction) return;

    onUpdateTransaction({
      ...tx,
      reconciliationStatus: tx.amount > 0 ? 'pending' : 'missing_receipt',
      matchedReceiptId: undefined,
      matchedInvoiceId: undefined,
      matchConfidence: undefined,
      matchReason: undefined,
    });
  };

  const handleAcceptSuggestedMatch = (tx: PSD2Transaction, receipt: Receipt, e: React.MouseEvent) => {
    e.stopPropagation();
    handleLinkExistingReceipt(tx, receipt);
  };

  const handleCsvFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const rawTxs = parseSwedishBankCsv(text);
      if (rawTxs.length === 0) {
        alert('Kunde inte hitta några giltiga transaktioner i CSV-filen. Kontrollera att filen innehåller kolumner för datum och belopp.');
        return;
      }

      // Reconcile against receipts and invoices
      const { reconciledTransactions, result } = reconcileTransactions(rawTxs, invoices, receipts);

      const fakeAccount: ConnectedBankAccount = {
        id: `acc-csv-${Date.now()}`,
        bankId: 'swedbank',
        bankName: `Kontoutdrag (${file.name})`,
        accountNumber: 'Importerad bankfil',
        iban: 'CSV Kontoutdrag',
        currency: 'SEK',
        balance: Math.round(reconciledTransactions.reduce((acc, t) => acc + t.amount, 0) * 100) / 100,
        lastSyncedAt: new Date().toISOString(),
        status: 'active',
      };

      if (onImportCsvTransactions) {
        onImportCsvTransactions(reconciledTransactions, fakeAccount);
      }

      setImportNotification(
        `Importerade ${rawTxs.length} transaktioner från ${file.name}. ${result.reconciledCount} poster matchades automatiskt mot dina verifikationer!`
      );
      setTimeout(() => setImportNotification(null), 8000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateBankTxFromReceipts = () => {
    if (receipts.length === 0) return;

    const newTxs: PSD2Transaction[] = receipts.map((rec) => ({
      id: `tx-receipt-${rec.id}`,
      accountId: 'acc-main-1930',
      bookingDate: rec.invoice_date.split('T')[0],
      valueDate: rec.invoice_date.split('T')[0],
      amount: -Number(rec.total_amount),
      currency: rec.currency || 'SEK',
      description: `Kortköp ${rec.vendor_name}`,
      merchantName: rec.vendor_name,
      category: rec.category,
      basAccount: rec.raw_ai_response?.bas_account || '5400',
      matchedReceiptId: rec.id,
      reconciliationStatus: 'reconciled' as const,
    }));

    const account: ConnectedBankAccount = {
      id: 'acc-main-1930',
      bankId: 'swedbank',
      bankName: 'Företagskonto (BAS 1930)',
      accountNumber: 'Bokfört bankkonto',
      iban: 'BAS 1930',
      currency: 'SEK',
      balance: Math.round(-receipts.reduce((sum, r) => sum + Number(r.total_amount), 0) * 100) / 100,
      lastSyncedAt: new Date().toISOString(),
      status: 'active',
    };

    if (onImportCsvTransactions) {
      onImportCsvTransactions(newTxs, account);
    }

    setImportNotification(
      `Bokförde ${newTxs.length} banktransaktioner från dina kvitton. Båda är nu fullständigt avstämda mot banken!`
    );
    setTimeout(() => setImportNotification(null), 8000);
  };

  const handleDownloadSampleCsv = () => {
    const headers = 'Bokföringsdatum;Transaktionsdatum;Text;Belopp;Bokfört saldo';
    const rows = [
      '2026-11-18;2026-11-18;Kortköp CIRCLE K SÖDERMÄLARSTRAND;-680,00;154285,00',
      '2026-11-17;2026-11-17;Kortköp HOTEL AT SIX STOCKHOLM;-2450,00;154965,00',
      '2026-11-16;2026-11-16;Klarna Bankgiro utb: KONTORSMATERIAL;-1290,00;157415,00',
      '2026-11-15;2026-11-15;Swish till privat konto;-1500,00;158705,00',
      '2026-11-14;2026-11-14;Bankgiro inbetalning: SPOTIFY AB FAKTURA-2026-001;45000,00;160205,00',
      '2026-11-10;2026-11-10;Kortköp BAUHAUS BARKARBY;-1502,00;115205,00',
      '2026-11-05;2026-11-05;Kortköp APPLE RETAIL SWEDEN TÄBY;-19990,00;116707,00',
      '2026-11-02;2026-11-02;Kortköp JYSK SVERIGE;-350,00;136697,00',
    ];
    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'swedbank-kontoutdrag-exempel.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const accountName = connectedAccount?.bankName || 'Företagskonto';
  const iban = connectedAccount?.iban || '';
  const balance = connectedAccount?.balance ?? 0;

  return (
    <div className="space-y-6">
      
      {/* Import Notification Banner */}
      {importNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importNotification}</span>
          </div>
          <button
            onClick={() => setImportNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. If No Bank Account Connected & No Transactions */}
      {!connectedAccount && transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e2d7] p-8 sm:p-10 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-center text-[#d97706] mx-auto shadow-2xs">
            <Landmark className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-bold text-lg text-[#1c1917]">Inget bankkonto anslutet</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Koppla ditt svenska företagskonto med BankID eller importera ett kontoutdrag (CSV) från din internetbank för att automatiskt matcha transaktioner mot dina kvitton.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenConnectBank}
              className="px-5 py-2.5 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-98"
            >
              <Landmark className="w-4 h-4 text-[#d97706]" />
              <span>Koppla bank via BankID</span>
            </button>

            <label className="px-5 py-2.5 rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-98">
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Importera kontoutdrag (CSV)</span>
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleCsvFileInput}
              />
            </label>
          </div>

          <div className="pt-4 border-t border-[#e7e2d7]/60 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
            {onLoadDemoBankData && (
              <button
                onClick={onLoadDemoBankData}
                className="hover:text-stone-900 underline transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Testa med exempeltransaktioner</span>
              </button>
            )}
            <span>•</span>
            <button
              onClick={handleDownloadSampleCsv}
              className="hover:text-stone-900 underline transition cursor-pointer flex items-center gap-1.5"
              title="Ladda ner ett förifyllt svenskt bankkontoutdrag (Swedbank CSV) för testning"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Ladda ner Swedbank exempel-CSV</span>
            </button>
          </div>
        </div>
      ) : (
        /* Connected / Has Transactions Header Card */
        <div className="bg-white rounded-2xl border border-[#e7e2d7] p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1c1917]/5 border border-[#1c1917]/15 flex items-center justify-center text-[#1c1917] shrink-0">
                <Landmark className="w-6 h-6 text-[#d97706]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-[#1c1917] tracking-tight">{accountName}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                    {connectedAccount?.iban === 'CSV Kontoutdrag' ? 'CSV Import' : 'PSD2 Live Feed'}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#f7f4ee] text-stone-600 border border-[#e7e2d7]">
                    {connectedAccount?.bankId ? connectedAccount.bankId.toUpperCase() : 'BANK FEED'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  {iban ? `IBAN: ${iban} • ` : ''}Bokfört saldo: <span className="font-bold text-[#1c1917] tabular-nums">{formatSEK(balance)}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <button
                onClick={handleRunAutoReconciliation}
                className="px-3.5 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
                title="Matcha alla banktransaktioner automatiskt mot dina kvitton och kundfakturor"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Kör Auto-avstämning</span>
              </button>

              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50 active:scale-98"
                title="Hämta senaste transaktioner via PSD2 Open Banking"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#d97706] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synkroniserar...' : 'Synka bankfeed'}</span>
              </button>

              <label className="px-3 py-2 rounded-xl border border-[#e7e2d7] bg-[#f7f4ee] hover:bg-[#eee8dc] text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Importera CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleCsvFileInput}
                />
              </label>

              <button
                onClick={handleDownloadSampleCsv}
                className="px-2.5 py-2 rounded-xl border border-[#e7e2d7] bg-white hover:bg-[#f7f4ee] text-stone-600 text-xs font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Ladda ner Swedbank exempel-CSV för testning"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span>Exempel-CSV</span>
              </button>

              <button
                onClick={onOpenConnectBank}
                className="px-3 py-2 rounded-xl border border-[#e7e2d7] bg-white hover:bg-[#f7f4ee] text-stone-600 text-xs font-medium transition cursor-pointer"
              >
                Byt bank
              </button>

              {onClearBankData && (
                <button
                  onClick={onClearBankData}
                  className="px-2.5 py-2 rounded-xl text-stone-400 hover:text-rose-600 text-xs font-medium transition cursor-pointer"
                  title="Rensa bankdata och koppla från"
                >
                  Koppla från
                </button>
              )}
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
      )}

      {/* 2. When No Transactions Exist Yet */}
      {transactions.length === 0 ? (
        <div className="space-y-4">
          {receipts.length > 0 && (
            <div className="rounded-2xl border border-[#e7e2d7] bg-white p-6 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f7f4ee] border border-[#e7e2d7] flex items-center justify-center text-[#d97706] shrink-0">
                    <ReceiptIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1c1917]">
                      Dina sparade kvitton ({receipts.length} st) – redo för bankavstämning
                    </h4>
                    <p className="text-xs text-stone-500">
                      Kvittona finns sparade i Klaro. Om köpen betalats med ditt företagskort kan du bokföra dem mot banken (BAS 1930) med ett klick.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCreateBankTxFromReceipts}
                  className="px-4 py-2.5 rounded-xl bg-[#1c1917] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-center shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Bokför som betalda via banken (1930)</span>
                </button>
              </div>

              {/* Receipt Cards */}
              <div className="divide-y divide-[#e7e2d7] border border-[#e7e2d7] rounded-xl overflow-hidden">
                {receipts.map((rec) => (
                  <div key={rec.id} className="p-3.5 flex items-center justify-between bg-stone-50/40 hover:bg-white transition text-xs">
                    <div className="flex items-center gap-3">
                      <ReceiptIcon className="w-4 h-4 text-stone-400" />
                      <div>
                        <span className="font-bold text-stone-900">{rec.vendor_name}</span>
                        <span className="text-stone-500 font-mono ml-2 text-[11px]">({formatDate(rec.invoice_date)})</span>
                        <span className="ml-2 text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded font-mono text-[10px]">
                          BAS {rec.raw_ai_response?.bas_account || '5400'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-stone-900 tabular-nums text-sm">
                        -{formatSEK(rec.total_amount)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Kvitto sparat</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {receipts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#e7e2d7] bg-white p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1c1917]">Inga kvitton eller banktransaktioner inlästa än</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Börja med att ladda upp eller fota ett kvitto, importera ett kontoutdrag (CSV), eller klicka på &apos;Ladda exempeltransaktioner&apos; ovan för att testa bankavstämningen.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
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
                ? 'bg-[#1c1917] text-white shadow-2xs font-semibold'
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
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition shadow-2xs"
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
              const suggestedReceipt = tx.suggestedReceiptId ? receipts.find((r) => r.id === tx.suggestedReceiptId) : null;
              const matchedReceipt = tx.matchedReceiptId ? receipts.find((r) => r.id === tx.matchedReceiptId) : null;
              const matchedInvoice = tx.matchedInvoiceId ? invoices.find((i) => i.id === tx.matchedInvoiceId) : null;

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

                  {/* Smart Match Reason / Confidence */}
                  {isReconciled && tx.matchReason && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5 w-fit">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{tx.matchReason}</span>
                    </div>
                  )}

                  {/* Suggested Receipt Match */}
                  {isMissing && suggestedReceipt && (
                    <div className="flex items-center justify-between gap-2 text-[11px] text-amber-900 bg-amber-50 border border-amber-300 rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                        <span className="truncate">Förslag: <strong>{suggestedReceipt.vendor_name}</strong> ({formatSEK(suggestedReceipt.total_amount)})</span>
                      </div>
                      <button
                        onClick={(e) => handleAcceptSuggestedMatch(tx, suggestedReceipt, e)}
                        className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] shadow-2xs transition shrink-0 cursor-pointer"
                      >
                        Koppla ✓
                      </button>
                    </div>
                  )}

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

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {isMissing && (
                        <>
                          <button
                            onClick={() => onOpenUpload('camera')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300 transition flex items-center gap-1 active:scale-95"
                            title="Fota kvitto med mobilkameran"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-700" />
                            <span>Fota kvitto</span>
                          </button>
                          <button
                            onClick={() => setSelectedTxForLink(tx)}
                            className="px-3 py-1.5 rounded-lg bg-[#1c1917] hover:bg-black text-white text-xs font-semibold shadow-xs active:scale-95 transition flex items-center gap-1"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Koppla</span>
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
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{matchedReceipt ? matchedReceipt.vendor_name : matchedInvoice ? `Faktura #${matchedInvoice.invoice_number}` : (tx.matchedInvoiceId || tx.matchedReceiptId || 'Verifikat')}</span>
                          </span>
                          <button
                            onClick={(e) => handleUnlinkTransaction(tx, e)}
                            className="text-stone-400 hover:text-rose-600 text-[11px] underline cursor-pointer"
                          >
                            Ångra
                          </button>
                        </div>
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
                  const suggestedReceipt = tx.suggestedReceiptId ? receipts.find((r) => r.id === tx.suggestedReceiptId) : null;
                  const matchedReceipt = tx.matchedReceiptId ? receipts.find((r) => r.id === tx.matchedReceiptId) : null;
                  const matchedInvoice = tx.matchedInvoiceId ? invoices.find((i) => i.id === tx.matchedInvoiceId) : null;

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
                            <div className="font-semibold text-zinc-900 group-hover:text-[#d97706] transition flex items-center gap-2">
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

                            {/* Smart Match Reason / Confidence */}
                            {isReconciled && tx.matchReason && (
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5 mt-1 w-fit">
                                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{tx.matchReason}</span>
                                {tx.matchConfidence && (
                                  <span className="font-mono text-[9px] bg-emerald-100 text-emerald-900 px-1 rounded font-bold">
                                    {Math.round(tx.matchConfidence * 100)}% match
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Suggested Receipt Match Pill */}
                            {isMissing && suggestedReceipt && (
                              <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 mt-1.5 w-fit shadow-2xs" onClick={(e) => e.stopPropagation()}>
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                                <span>Föreslagen match: <strong>{suggestedReceipt.vendor_name}</strong> ({formatSEK(suggestedReceipt.total_amount)})</span>
                                <button
                                  onClick={(e) => handleAcceptSuggestedMatch(tx, suggestedReceipt, e)}
                                  className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] shadow-2xs transition cursor-pointer"
                                  title="Koppla kvitto direkt med 1 klick"
                                >
                                  Koppla ✓
                                </button>
                              </div>
                            )}
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
                            {suggestedReceipt && (
                              <button
                                onClick={(e) => handleAcceptSuggestedMatch(tx, suggestedReceipt, e)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Godkänn föreslagen kvitto-matchning"
                              >
                                <Sparkles className="w-3 h-3 text-amber-200" />
                                <span>Koppla {suggestedReceipt.vendor_name}</span>
                              </button>
                            )}

                            <button
                              onClick={() => onOpenUpload('camera')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-300 transition shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Fota kvitto med mobilkameran direkt"
                            >
                              <Camera className="w-3 h-3 text-amber-700" />
                              <span>Fota</span>
                            </button>

                            <button
                              onClick={() => setSelectedTxForLink(tx)}
                              className="px-2.5 py-1 rounded-lg bg-[#1c1917] hover:bg-black text-white text-[11px] font-semibold transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
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
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="font-semibold">{matchedReceipt ? matchedReceipt.vendor_name : matchedInvoice ? `Faktura #${matchedInvoice.invoice_number}` : (tx.matchedInvoiceId || tx.matchedReceiptId || 'Verifikat')}</span>
                            </div>
                            <button
                              onClick={(e) => handleUnlinkTransaction(tx, e)}
                              className="text-stone-400 hover:text-rose-600 text-[11px] underline cursor-pointer"
                              title="Koppla loss kvitto/faktura från denna transaktion"
                            >
                              Ångra
                            </button>
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
      </>
      )}

      {/* 5. Modal: Connect or Quick Create Receipt for Transaction (Mobile Bottom Sheet) */}
      {selectedTxForLink && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-200 mx-auto -mt-2 mb-2 sm:hidden" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1c1917]/10 border border-[#1c1917]/20 flex items-center justify-center text-[#1c1917]">
                  <Link2 className="w-4 h-4 text-[#d97706]" />
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

            {/* Quick Mobile Camera Trigger */}
            <button
              onClick={() => {
                setSelectedTxForLink(null);
                onOpenUpload('camera');
              }}
              className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
            >
              <Camera className="w-4 h-4 text-amber-700" />
              <span>Fota kvitto med mobilkameran direkt</span>
            </button>

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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
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
                className="w-full py-2.5 rounded-xl bg-[#1c1917] hover:bg-black text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="text-[#d97706] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-[#1c1917] hover:bg-black text-white text-xs font-semibold cursor-pointer transition shadow-xs"
                >
                  Koppla kvitto nu
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. Modal: Auto-Reconciliation Summary Modal */}
      {autoReconcileModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#e7e2d7] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#d97706] shrink-0">
                  <Sparkles className="w-6 h-6 text-[#d97706]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1c1917] tracking-tight">Auto-avstämning klar!</h3>
                  <p className="text-xs text-stone-500">
                    Klaros intelligenta motor har gått igenom banken mot dina kvitton och fakturor.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoReconcileModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Avstämda poster
                </span>
                <div className="text-xl font-bold text-emerald-950 tabular-nums mt-1">
                  {autoReconcileModal.result.reconciledCount} st
                </div>
                {autoReconcileModal.newlyMatchedCount > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">
                    +{autoReconcileModal.newlyMatchedCount} nya matchades nyss!
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Saknar underlag
                </span>
                <div className="text-xl font-bold text-stone-900 tabular-nums mt-1">
                  {autoReconcileModal.result.unreconciledExpensesCount} st
                </div>
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Kräver kvitto eller foto
                </span>
              </div>
            </div>

            {/* Tax Savings Summary */}
            <div className="p-4 rounded-2xl bg-[#f7f4ee] border border-[#e7e2d7] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Säkrat skatteavdrag för avstämda inköp</span>
                <span className="font-bold text-[#15803d] font-mono text-sm">
                  {formatSEK(
                    Math.round(
                      (transactions
                        .filter((t) => t.reconciliationStatus === 'reconciled' && t.amount < 0)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0) *
                        0.54)
                    )
                  )}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Varje avstämd transaktion är 100% säkrad för Skatteverkets revision enligt Bokföringslagen. Momsen och kostnadsavdraget dras automatiskt i din moms- & skattedeklaration.
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAutoReconcileModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1c1917] hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Klar, visa bankflödet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
