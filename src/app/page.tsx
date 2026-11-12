'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar, ActiveView } from '@/components/dashboard/Sidebar';
import { Header, QuarterPeriod } from '@/components/dashboard/Header';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { ReceiptsTable } from '@/components/dashboard/ReceiptsTable';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { TaxView } from '@/components/dashboard/TaxView';
import { BankReconciliationTab } from '@/components/dashboard/BankReconciliationTab';
import { ReceiptUploadModal } from '@/components/dashboard/ReceiptUploadModal';
import { InvoiceBuilderModal } from '@/components/dashboard/InvoiceBuilderModal';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { PayMomsModal } from '@/components/dashboard/PayMomsModal';
import { SkatteverketDeclarationModal } from '@/components/dashboard/SkatteverketDeclarationModal';
import { OnboardingWizard, BusinessConfig } from '@/components/dashboard/OnboardingWizard';
import { OpenBankingModal } from '@/components/dashboard/OpenBankingModal';
import { KivraInboxModal } from '@/components/dashboard/KivraInboxModal';
import { EmailForwardingModal } from '@/components/dashboard/EmailForwardingModal';
import { AuthModal } from '@/components/dashboard/AuthModal';
import { INITIAL_INVOICES, INITIAL_RECEIPTS } from '@/lib/mock-data';
import { ConnectedBankAccount, PSD2Transaction } from '@/lib/open-banking/types';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { calculateSwedishTaxBuffer } from '@/lib/tax-calculator';
import { generateSIE4File, downloadSIE4File } from '@/lib/sie-exporter';
import { Receipt, Invoice, SwedishVatRate } from '@/types/database';

export default function DashboardPage() {
  // Active Navigation View (Left Sidebar)
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

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
    setPreviewInvoice(newInvoice);
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
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900 flex font-sans selection:bg-zinc-200">
      
      {/* 1. Left Navigation Sidebar (Stripe / Linear style) */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        companyType={businessConfig.companyType}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
        onSwitchCompanyType={(newType) => {
          setBusinessConfig((prev) => ({
            ...prev,
            companyType: newType,
            companyName: newType === 'aktiebolag' ? 'Nordic Tech Solutions AB' : 'Mohak Konsulting EF',
            orgNr: newType === 'aktiebolag' ? '559123-4567' : '19890412-1234',
          }));
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
        onOpenKivra={() => setIsKivraOpen(true)}
        onOpenEmailForwarding={() => setIsEmailForwardingOpen(true)}
        onOpenSettings={() => setIsOnboardingOpen(true)}
        receiptsCount={filteredReceipts.length}
        invoicesCount={filteredInvoices.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <Header
          activeView={activeView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          netMoms={taxBuffer.moms.netMoms}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
          onOpenPayMoms={() => setIsPayMomsOpen(true)}
          onOpenDeclaration={() => setIsDeclarationOpen(true)}
          onExportSIE={handleExportSIE}
          onSyncBank={handleSyncTransactions}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* View 1: Översikt (Cockpit) */}
          {activeView === 'overview' && (
            <OverviewView
              taxBuffer={taxBuffer}
              companyType={businessConfig.companyType}
              receipts={filteredReceipts}
              invoices={filteredInvoices}
              onNavigateToExpenses={() => setActiveView('expenses')}
              onNavigateToInvoices={() => setActiveView('invoices')}
              onNavigateToTax={() => setActiveView('tax')}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenPayMoms={() => setIsPayMomsOpen(true)}
            />
          )}

          {/* View 2: Utgifter & Kvitton (Dedicated full workspace) */}
          {activeView === 'expenses' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ReceiptsTable
                receipts={filteredReceipts}
                onDeleteReceipt={handleDeleteReceipt}
                onVerifyReceipt={handleVerifyReceipt}
                onUpdateReceiptVatRate={handleUpdateReceiptVatRate}
                onExportSIE={handleExportSIE}
              />
            </div>
          )}

          {/* View 3: Kundfakturor (Dedicated invoicing workspace) */}
          {activeView === 'invoices' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <InvoicesTable
                invoices={filteredInvoices}
                onOpenAddInvoice={() => setIsInvoiceBuilderOpen(true)}
                onSelectInvoice={(inv) => setPreviewInvoice(inv)}
              />
            </div>
          )}

          {/* View 4: Skatt & Deklaration (Momsdeklaration, simulator & guide) */}
          {activeView === 'tax' && (
            <TaxView
              taxBuffer={taxBuffer}
              businessConfig={businessConfig}
              invoices={filteredInvoices}
              receipts={filteredReceipts}
              onOpenDeclaration={() => setIsDeclarationOpen(true)}
              onOpenPayMoms={() => setIsPayMomsOpen(true)}
            />
          )}

          {/* View 5: Bank & Avstämning (Open Banking PSD2 feed) */}
          {activeView === 'bank' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <BankReconciliationTab
                transactions={bankTransactions}
                connectedAccount={connectedAccount}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenConnectBank={() => setIsOpenBankingOpen(true)}
                onSyncTransactions={handleSyncTransactions}
              />
            </div>
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Klaro — Automatiserad skattebuffert & fakturering för svenska företagare.</span>
            <span className="font-mono text-zinc-400">SIE-4 Standard • Skatteverket 2026 • F-skatt</span>
          </div>
        </footer>

      </div>

      {/* Modals & Dialogs */}
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

      <InvoicePreviewModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
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
