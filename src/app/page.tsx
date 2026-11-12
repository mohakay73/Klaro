'use client';

import React, { useState, useMemo } from 'react';
import { Header, QuarterPeriod } from '@/components/dashboard/Header';
import { SafeToSpendWidget } from '@/components/dashboard/SafeToSpendWidget';
import { MomsSummaryCard } from '@/components/dashboard/MomsSummaryCard';
import { RevenueExpenseCards } from '@/components/dashboard/RevenueExpenseCards';
import { ReceiptsTable } from '@/components/dashboard/ReceiptsTable';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { ReceiptUploadModal } from '@/components/dashboard/ReceiptUploadModal';
import { InvoiceBuilderModal } from '@/components/dashboard/InvoiceBuilderModal';
import { PayMomsModal } from '@/components/dashboard/PayMomsModal';
import { SkatteverketDeclarationModal } from '@/components/dashboard/SkatteverketDeclarationModal';
import { OnboardingWizard, BusinessConfig } from '@/components/dashboard/OnboardingWizard';
import { BankReconciliationTab } from '@/components/dashboard/BankReconciliationTab';
import { OpenBankingModal } from '@/components/dashboard/OpenBankingModal';
import { TaxSimulatorWidget } from '@/components/dashboard/TaxSimulatorWidget';
import { KivraInboxModal } from '@/components/dashboard/KivraInboxModal';
import { EmailForwardingModal } from '@/components/dashboard/EmailForwardingModal';
import { AuthModal } from '@/components/dashboard/AuthModal';
import { INITIAL_INVOICES, INITIAL_RECEIPTS } from '@/lib/mock-data';
import { ConnectedBankAccount, PSD2Transaction } from '@/lib/open-banking/types';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { calculateSwedishTaxBuffer } from '@/lib/tax-calculator';
import { generateSIE4File, downloadSIE4File } from '@/lib/sie-exporter';
import { Receipt, Invoice, SwedishVatRate } from '@/types/database';
import { 
  Receipt as ReceiptIcon, 
  FileCheck, 
  BookOpen, 
  Landmark, 
  Calculator,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  // Business Profile & Tax Settings
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    companyType: 'enskild_firma',
    companyName: 'Lindqvist Digital Design (Enskild Firma)',
    orgNr: '559123-4567',
    hasFSkatt: true,
    vatPeriod: 'quarterly',
    estimatedYearlyRevenue: 950000,
    municipalTaxRate: 0.32,
  });

  // Selected Period
  const [selectedPeriod, setSelectedPeriod] = useState<QuarterPeriod>('Q2');

  // Supabase Auth User state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Connected Bank Account & PSD2 Transactions
  const [connectedAccount, setConnectedAccount] = useState<ConnectedBankAccount | null>(
    tinkClient.getMockSandboxAccounts('handelsbanken')[0]
  );
  const [bankTransactions, setBankTransactions] = useState<PSD2Transaction[]>(
    tinkClient.getMockSandboxTransactions('acc-handelsbanken-main')
  );

  // Data collections
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'receipts' | 'invoices' | 'bank_feed' | 'simulator' | 'tax_guide'>('receipts');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [isPayMomsOpen, setIsPayMomsOpen] = useState(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isKivraOpen, setIsKivraOpen] = useState(false);
  const [isEmailForwardingOpen, setIsEmailForwardingOpen] = useState(false);
  const [isOpenBankingOpen, setIsOpenBankingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Filter items by selected quarter if applicable
  const filteredInvoices = useMemo(() => {
    if (selectedPeriod === 'ALL') return invoices;
    return invoices.filter((inv) => {
      const month = new Date(inv.invoice_date).getMonth() + 1;
      if (selectedPeriod === 'Q1') return month >= 1 && month <= 3;
      if (selectedPeriod === 'Q2') return month >= 4 && month <= 6;
      if (selectedPeriod === 'Q3') return month >= 7 && month <= 9;
      if (selectedPeriod === 'Q4') return month >= 10 && month <= 12;
      return true;
    });
  }, [invoices, selectedPeriod]);

  const filteredReceipts = useMemo(() => {
    if (selectedPeriod === 'ALL') return receipts;
    return receipts.filter((rec) => {
      const month = new Date(rec.invoice_date).getMonth() + 1;
      if (selectedPeriod === 'Q1') return month >= 1 && month <= 3;
      if (selectedPeriod === 'Q2') return month >= 4 && month <= 6;
      if (selectedPeriod === 'Q3') return month >= 7 && month <= 9;
      if (selectedPeriod === 'Q4') return month >= 10 && month <= 12;
      return true;
    });
  }, [receipts, selectedPeriod]);

  // Real-time Swedish Tax Buffer Engine
  const taxBuffer = useMemo(() => {
    return calculateSwedishTaxBuffer(filteredInvoices, filteredReceipts, {
      companyType: businessConfig.companyType,
      estimatedMunicipalTaxRate: businessConfig.municipalTaxRate,
    });
  }, [filteredInvoices, filteredReceipts, businessConfig]);

  // Actions
  const handleReceiptAdded = (newReceipt: Receipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const handleVerifyReceipt = (id: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'verified' as const } : r))
    );
  };

  const handleUpdateReceiptVatRate = (id: string, newRate: SwedishVatRate) => {
    setReceipts((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const total = r.total_amount;
        const newVat = newRate > 0 ? Math.round((total - total / (1 + newRate / 100)) * 100) / 100 : 0;
        return {
          ...r,
          vat_rate: newRate,
          vat_amount: newVat,
          status: 'verified' as const,
        };
      })
    );
  };

  const handleExportSIE = () => {
    const sieContent = generateSIE4File({
      companyName: businessConfig.companyName,
      orgNr: businessConfig.orgNr,
      year: 2026,
      invoices: filteredInvoices,
      receipts: filteredReceipts,
    });
    downloadSIE4File(sieContent, `klaro-${businessConfig.orgNr.replace(/[^0-9]/g, '')}-2026.se`);
  };

  const handleConnectBankAccount = (account: ConnectedBankAccount, txs: PSD2Transaction[]) => {
    setConnectedAccount(account);
    setBankTransactions(txs);
  };

  const handleSyncTransactions = async () => {
    try {
      const res = await fetch('/api/open-banking/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: connectedAccount?.id || 'acc-handelsbanken-main',
          invoices: filteredInvoices,
          receipts: filteredReceipts,
        }),
      });
      const data = await res.json();
      if (data.transactions) {
        setBankTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error syncing transactions:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Top Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
        onOpenPayMoms={() => setIsPayMomsOpen(true)}
        onOpenDeclaration={() => setIsDeclarationOpen(true)}
        onOpenSettings={() => setIsOnboardingOpen(true)}
        onOpenKivra={() => setIsKivraOpen(true)}
        onOpenEmailForwarding={() => setIsEmailForwardingOpen(true)}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        companyType={businessConfig.companyType}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
        netMoms={taxBuffer.moms.netMoms}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section: Safe to Spend & Tax Buffer Widget */}
        <SafeToSpendWidget taxBuffer={taxBuffer} companyType={businessConfig.companyType} />

        {/* Top 3 Stat Cards: Revenue, Expenses, Profit */}
        <RevenueExpenseCards taxBuffer={taxBuffer} />

        {/* Swedish Skatteverket Momsdeklaration Card */}
        <MomsSummaryCard moms={taxBuffer.moms} />

        {/* Tab Navigation for Data Tables & Bank Integration */}
        <div className="space-y-4">
          <div className="flex border-b border-zinc-800 text-xs sm:text-sm font-medium overflow-x-auto">
            
            <button
              onClick={() => setActiveTab('receipts')}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'receipts'
                  ? 'border-emerald-500 text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ReceiptIcon className="w-4 h-4 text-emerald-400" />
              <span>Utgifter & Kvitton ({filteredReceipts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'border-emerald-500 text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-sky-400" />
              <span>Kundfakturor ({filteredInvoices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bank_feed')}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'bank_feed'
                  ? 'border-emerald-500 text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>Bankavstämning (PSD2 Feed)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'border-emerald-500 text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-purple-400" />
              <span>Skatte- & Vinstsimulator</span>
            </button>

            <button
              onClick={() => setActiveTab('tax_guide')}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'tax_guide'
                  ? 'border-emerald-500 text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Skatteverkets Regler</span>
            </button>

          </div>

          {/* Tab 1: Receipts Table (with BAS-kontoplan & SIE export) */}
          {activeTab === 'receipts' && (
            <ReceiptsTable
              receipts={filteredReceipts}
              onDeleteReceipt={handleDeleteReceipt}
              onVerifyReceipt={handleVerifyReceipt}
              onUpdateReceiptVatRate={handleUpdateReceiptVatRate}
              onExportSIE={handleExportSIE}
            />
          )}

          {/* Tab 2: Invoices Table */}
          {activeTab === 'invoices' && (
            <InvoicesTable
              invoices={filteredInvoices}
              onOpenAddInvoice={() => setIsInvoiceBuilderOpen(true)}
            />
          )}

          {/* Tab 3: Open Banking PSD2 Feed */}
          {activeTab === 'bank_feed' && (
            <BankReconciliationTab
              transactions={bankTransactions}
              connectedAccount={connectedAccount}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenConnectBank={() => setIsOpenBankingOpen(true)}
              onSyncTransactions={handleSyncTransactions}
            />
          )}

          {/* Tab 4: Tax Scenario Forecaster */}
          {activeTab === 'simulator' && (
            <TaxSimulatorWidget
              currentInvoices={filteredInvoices}
              currentReceipts={filteredReceipts}
              companyType={businessConfig.companyType}
              municipalTaxRate={businessConfig.municipalTaxRate}
            />
          )}

          {/* Tab 5: Swedish Tax Guide & Transparency */}
          {activeTab === 'tax_guide' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6 text-xs text-zinc-300">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Hur beräknar Klaro din svenska skattebuffert och säkert disponibelt belopp?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Enskild Firma Rules */}
                <div className="space-y-3 p-4 rounded-lg bg-zinc-950/80 border border-zinc-800">
                  <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Enskild Firma (F-skatt & Egenavgifter)
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    I en enskild firma beskattas du på <strong>verksamhetens skattemässiga överskott</strong> (nettointäkter minus avdragsgilla kostnader exkl. moms):
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
                    <li>
                      <strong className="text-zinc-200">Schablonavdrag för egenavgifter (25%):</strong> Skatteverket ger ett automatiskt avdrag på 25% av vinsten före beräkning av sociala avgifter.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Egenavgifter (28,97%):</strong> Beräknas på överskottet efter schablonavdrag. Effektiv avgift blir ca 21,7% av bruttovinsten.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Kommunalskatt (ca {businessConfig.municipalTaxRate * 100}%):</strong> Dras på vinsten minus egenavgifterna.
                    </li>
                    <li>
                      <strong className="text-emerald-400">Total F-skatt reserv:</strong> Rekommenderas alltid ligga mellan 40% och 43% av vinsten för att aldrig få kvarskatt.
                    </li>
                  </ul>
                </div>

                {/* Moms Rules */}
                <div className="space-y-3 p-4 rounded-lg bg-zinc-950/80 border border-zinc-800">
                  <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Mervärdesskatt (Momsdeklaration)
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Moms är aldrig ditt företags pengar, utan skatt du kräver in och håller för staten:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
                    <li>
                      <strong className="text-zinc-200">Utgående moms (Moms på försäljning):</strong> Pengar dina kunder betalar in till dig (vanligen 25%, 12% eller 6%).
                    </li>
                    <li>
                      <strong className="text-zinc-200">Ingående moms (Avdragsgill moms):</strong> Den moms du betalat på företagsutgifter och kvitton. Dras av krona för krona mot utgående moms (Ruta 48).
                    </li>
                    <li>
                      <strong className="text-amber-400">Netto moms:</strong> Om Utgående &gt; Ingående moms måste mellanskillnaden reserveras och betalas in via Bankgiro 5050-1055.
                    </li>
                  </ul>
                </div>

              </div>

              {/* Safe to Spend formula summary */}
              <div className="p-4 rounded-lg bg-emerald-950/15 border border-emerald-500/20 text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Klaros princip för "Säkert att ta ut":
                </span>
                <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                  Säkert att ta ut = Oskattad vinst (exkl moms) - Reserverad F-skatt (Egenavgifter + Kommunalskatt) - Netto moms som tillhör Skatteverket
                </p>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Klaro — Automatiserad skattebuffert & fakturering för svenska frilansare.</span>
          <span className="font-mono text-zinc-500">SIE-4 Standard • Mervärdesskattelagen • Skatteverket 2026</span>
        </div>
      </footer>

      {/* All Modals */}
      <ReceiptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onReceiptAdded={handleReceiptAdded}
      />

      <InvoiceBuilderModal
        isOpen={isInvoiceBuilderOpen}
        onClose={() => setIsInvoiceBuilderOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
      />

      <PayMomsModal
        isOpen={isPayMomsOpen}
        onClose={() => setIsPayMomsOpen(false)}
        netMoms={taxBuffer.moms.netMoms}
        orgNr={businessConfig.orgNr}
        companyName={businessConfig.companyName}
        dueDate={taxBuffer.nextMomsDeadline}
      />

      <SkatteverketDeclarationModal
        isOpen={isDeclarationOpen}
        onClose={() => setIsDeclarationOpen(false)}
        moms={taxBuffer.moms}
        periodName={`Kvartal ${selectedPeriod}`}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialConfig={businessConfig}
        onComplete={(newConfig) => setBusinessConfig(newConfig)}
      />

      <KivraInboxModal
        isOpen={isKivraOpen}
        onClose={() => setIsKivraOpen(false)}
        onImportReceipt={handleReceiptAdded}
      />

      <EmailForwardingModal
        isOpen={isEmailForwardingOpen}
        onClose={() => setIsEmailForwardingOpen(false)}
        onReceiptIngested={handleReceiptAdded}
      />

      <OpenBankingModal
        isOpen={isOpenBankingOpen}
        onClose={() => setIsOpenBankingOpen(false)}
        connectedAccount={connectedAccount}
        onConnectAccount={handleConnectBankAccount}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

    </div>
  );
}
