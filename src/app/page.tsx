'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar, ActiveView } from '@/components/dashboard/Sidebar';
import { Header, QuarterPeriod } from '@/components/dashboard/Header';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { ReceiptsTable } from '@/components/dashboard/ReceiptsTable';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { TaxView } from '@/components/dashboard/TaxView';
import { BankReconciliationTab } from '@/components/dashboard/BankReconciliationTab';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { ReceiptUploadModal } from '@/components/dashboard/ReceiptUploadModal';
import { InvoiceBuilderModal } from '@/components/dashboard/InvoiceBuilderModal';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { PayMomsModal } from '@/components/dashboard/PayMomsModal';
import { SkatteverketDeclarationModal } from '@/components/dashboard/SkatteverketDeclarationModal';
import { OnboardingWizard, BusinessConfig } from '@/components/dashboard/OnboardingWizard';
import { OpenBankingModal } from '@/components/dashboard/OpenBankingModal';
import { DemoWalkthroughModal, DemoScenario } from '@/components/dashboard/DemoWalkthroughModal';
import { KivraInboxModal } from '@/components/dashboard/KivraInboxModal';
import { EmailForwardingModal } from '@/components/dashboard/EmailForwardingModal';
import { AuthModal } from '@/components/dashboard/AuthModal';
import { LandingPage } from '@/components/landing/LandingPage';
import { INITIAL_INVOICES, INITIAL_RECEIPTS } from '@/lib/mock-data';
import { ConnectedBankAccount, PSD2Transaction } from '@/lib/open-banking/types';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { calculateSwedishTaxBuffer } from '@/lib/tax-calculator';
import { generateSIE4File, downloadSIE4File } from '@/lib/sie-exporter';
import { Receipt, Invoice, SwedishVatRate } from '@/types/database';
import { Sparkles, ShieldCheck, RotateCcw } from 'lucide-react';

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
    bankgiro: '5050-1055',
    swishNumber: '123 456 78 90',
  });

  // Selected Period (Defaults to ALL so receipts in any quarter like Q4 are immediately visible)
  const [selectedPeriod, setSelectedPeriod] = useState<QuarterPeriod>('ALL');

  // Supabase Auth User state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Connected Bank Account & PSD2 Transactions
  const [connectedAccount, setConnectedAccount] = useState<ConnectedBankAccount | null>(null);
  const [bankTransactions, setBankTransactions] = useState<PSD2Transaction[]>([]);

  // Data collections
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [hideSampleData, setHideSampleData] = useState<boolean>(false);
  const [isSampleDataActive, setIsSampleDataActive] = useState<boolean>(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadModalMode, setUploadModalMode] = useState<'default' | 'camera' | 'text'>('default');
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [isPayMomsOpen, setIsPayMomsOpen] = useState(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isKivraOpen, setIsKivraOpen] = useState(false);
  const [isEmailForwardingOpen, setIsEmailForwardingOpen] = useState(false);
  const [isOpenBankingOpen, setIsOpenBankingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
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

  // Fetch user data from Neon via API
  const loadUserData = async (userId: string, shouldHideSample?: boolean) => {
    const hide = shouldHideSample !== undefined ? shouldHideSample : hideSampleData;
    try {
      // 1. Fetch Receipts for this user
      const recRes = await fetch(`/api/receipts?userId=${encodeURIComponent(userId)}&includeSample=${!hide}`);
      const recData = await recRes.json();
      if (recData.receipts) {
        setReceipts(recData.receipts);
        setIsSampleDataActive(Boolean(recData.isSample));
      }

      // 2. Fetch Invoices for this user
      const invRes = await fetch(`/api/invoices?userId=${encodeURIComponent(userId)}&includeSample=${!hide}`);
      const invData = await invRes.json();
      if (invData.invoices) {
        setInvoices(invData.invoices);
      }
    } catch (err) {
      console.warn('Could not load user data from database:', err);
    }
  };

  const handleClearSampleData = () => {
    setHideSampleData(true);
    setIsSampleDataActive(false);
    setConnectedAccount(null);
    setBankTransactions([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('klaro_hide_sample_data', 'true');
      localStorage.setItem('klaro_hide_bank_mock', 'true');
      localStorage.removeItem('klaro_bank_transactions');
      localStorage.removeItem('klaro_connected_account');
    }
    if (currentUser) {
      loadUserData(currentUser.id, true);
    } else {
      setReceipts([]);
      setInvoices([]);
    }
  };

  const handleRestoreSampleData = () => {
    setHideSampleData(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('klaro_hide_sample_data');
      localStorage.removeItem('klaro_hide_bank_mock');
    }
    setConnectedAccount(tinkClient.getMockSandboxAccounts('handelsbanken')[0]);
    setBankTransactions(tinkClient.getMockSandboxTransactions('acc-handelsbanken-main'));
    if (currentUser) {
      loadUserData(currentUser.id, false);
    } else {
      setReceipts(INITIAL_RECEIPTS);
      setInvoices(INITIAL_INVOICES);
      setIsSampleDataActive(true);
    }
  };

  // Actions
  const handleReceiptAdded = (newReceipt: Receipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);

    // If added manually outside file upload (i.e. temporary client ID), sync to database
    if (newReceipt.id.startsWith('rec-')) {
      fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReceipt),
      }).catch((err) => console.warn('Receipt sync notice:', err));
    }
  };

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setPreviewInvoice(newInvoice);

    // Persist invoice to database
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoice),
    }).catch((err) => console.warn('Invoice save notice:', err));
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));

    // Delete from database
    const userParam = currentUser?.id ? `&userId=${encodeURIComponent(currentUser.id)}` : '';
    fetch(`/api/receipts?id=${encodeURIComponent(id)}${userParam}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Receipt delete notice:', err));
  };

  const handleVerifyReceipt = (id: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'verified' as const } : r))
    );

    // Update in database
    fetch('/api/receipts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'verified', userId: currentUser?.id }),
    }).catch((err) => console.warn('Receipt verify notice:', err));
  };

  const handleUpdateReceiptVatRate = (id: string, newRate: SwedishVatRate) => {
    const target = receipts.find((r) => r.id === id);
    const total = target ? Number(target.total_amount) : 0;
    const newVat = newRate > 0 ? Math.round((total - total / (1 + newRate / 100)) * 100) / 100 : 0;

    setReceipts((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          vat_rate: newRate,
          vat_amount: newVat,
          status: 'verified' as const,
        };
      })
    );

    // Update in database
    fetch('/api/receipts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, vat_rate: newRate, vat_amount: newVat, status: 'verified', userId: currentUser?.id }),
    }).catch((err) => console.warn('Receipt update notice:', err));
  };

  const handleUpdateReceiptDate = (id: string, newDate: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, invoice_date: newDate } : r))
    );

    // Update in database
    fetch('/api/receipts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, invoice_date: newDate, userId: currentUser?.id }),
    }).catch((err) => console.warn('Receipt date update notice:', err));
  };

  const handleOpenUpload = (mode: 'default' | 'camera' | 'text' = 'default') => {
    setUploadModalMode(mode);
    setIsUploadOpen(true);
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

  const handleSaveBusinessConfig = async (newConfig: BusinessConfig) => {
    setBusinessConfig(newConfig);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('klaro_business_config', JSON.stringify(newConfig));
      } catch {}
    }

    // Persist to Neon PostgreSQL
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          email: currentUser?.email,
          companyName: newConfig.companyName,
          companyType: newConfig.companyType,
          orgNr: newConfig.orgNr,
          hasFSkatt: newConfig.hasFSkatt,
          vatPeriod: newConfig.vatPeriod,
          municipalTaxRate: newConfig.municipalTaxRate,
          estimatedYearlyRevenue: newConfig.estimatedYearlyRevenue,
          bankgiro: newConfig.bankgiro,
          swishNumber: newConfig.swishNumber,
        }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.warn('Note on persisting business settings to Neon:', err);
    }
  };

  const handleConnectBankAccount = (account: ConnectedBankAccount, txs: PSD2Transaction[]) => {
    setConnectedAccount(account);
    setBankTransactions(txs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('klaro_connected_account', JSON.stringify(account));
      localStorage.setItem('klaro_bank_transactions', JSON.stringify(txs));
      localStorage.removeItem('klaro_hide_bank_mock');
    }
  };

  const handleClearBankData = () => {
    setConnectedAccount(null);
    setBankTransactions([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('klaro_bank_transactions');
      localStorage.removeItem('klaro_connected_account');
      localStorage.setItem('klaro_hide_bank_mock', 'true');
    }
  };

  const handleLoadDemoBankData = () => {
    const acc = tinkClient.getMockSandboxAccounts('handelsbanken')[0];
    const txs = tinkClient.getMockSandboxTransactions('acc-handelsbanken-main', receipts, invoices);
    setConnectedAccount(acc);
    setBankTransactions(txs);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('klaro_hide_bank_mock');
      localStorage.setItem('klaro_connected_account', JSON.stringify(acc));
      localStorage.setItem('klaro_bank_transactions', JSON.stringify(txs));
    }
  };

  const handleImportCsvTransactions = (txs: PSD2Transaction[], account?: ConnectedBankAccount) => {
    setBankTransactions(txs);
    if (account) {
      setConnectedAccount(account);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('klaro_bank_transactions', JSON.stringify(txs));
      if (account) {
        localStorage.setItem('klaro_connected_account', JSON.stringify(account));
      }
      localStorage.setItem('klaro_hide_bank_mock', 'true');
    }
  };

  const handleUpdateTransaction = (updatedTx: PSD2Transaction) => {
    setBankTransactions((prev) => {
      const next = prev.map((t) => (t.id === updatedTx.id ? updatedTx : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('klaro_bank_transactions', JSON.stringify(next));
      }
      return next;
    });
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

  const handleLoadScenario = (scenario: DemoScenario) => {
    if (scenario === 'standard_ef') {
      setBusinessConfig({
        companyType: 'enskild_firma',
        companyName: 'Lindqvist Digital Design (Enskild Firma)',
        orgNr: '559123-4567',
        hasFSkatt: true,
        vatPeriod: 'quarterly',
        estimatedYearlyRevenue: 950000,
        municipalTaxRate: 0.32,
      });
      setInvoices(INITIAL_INVOICES);
      setReceipts(INITIAL_RECEIPTS);
      setBankTransactions(tinkClient.getMockSandboxTransactions('acc-handelsbanken-main'));
    } else if (scenario === 'new_ab') {
      setBusinessConfig({
        companyType: 'aktiebolag',
        companyName: 'Nordic Tech Solutions AB',
        orgNr: '559123-4567',
        hasFSkatt: true,
        vatPeriod: 'quarterly',
        estimatedYearlyRevenue: 1200000,
        municipalTaxRate: 0.32,
      });
      setBankTransactions((prev) =>
        prev.map((t) => (t.reconciliationStatus === 'private_draw' ? { ...t, basAccount: '2893' } : t))
      );
    } else if (scenario === 'all_reconciled') {
      // Mark all bank transactions reconciled (0 missing receipts)
      setBankTransactions((prev) =>
        prev.map((t) => {
          if (t.reconciliationStatus === 'missing_receipt') {
            return {
              ...t,
              reconciliationStatus: 'reconciled' as const,
              matchedReceiptId: `rec-quick-${t.id}`,
            };
          }
          return t;
        })
      );
    }
  };

  const handleResetDemoData = () => {
    setBusinessConfig({
      companyType: 'enskild_firma',
      companyName: 'Lindqvist Digital Design (Enskild Firma)',
      orgNr: '559123-4567',
      hasFSkatt: true,
      vatPeriod: 'quarterly',
      estimatedYearlyRevenue: 950000,
      municipalTaxRate: 0.32,
    });
    setInvoices(INITIAL_INVOICES);
    setReceipts(INITIAL_RECEIPTS);
    setBankTransactions(tinkClient.getMockSandboxTransactions('acc-handelsbanken-main'));
  };

  const missingBankReceiptsCount = useMemo(() => {
    return bankTransactions.filter((t) => t.reconciliationStatus === 'missing_receipt').length;
  }, [bankTransactions]);

  // Handle URL query parameters and Supabase Auth session
  useEffect(() => {
    let savedHidePref = false;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === 'true') {
        setIsDemoTourOpen(true);
      }
      if (params.get('view') === 'landing') {
        setActiveView('landing');
      }
      savedHidePref = localStorage.getItem('klaro_hide_sample_data') === 'true';
      const hideBankMock = localStorage.getItem('klaro_hide_bank_mock') === 'true';
      const savedBankTx = localStorage.getItem('klaro_bank_transactions');
      const savedBankAcc = localStorage.getItem('klaro_connected_account');
      const savedConfig = localStorage.getItem('klaro_business_config');

      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setBusinessConfig((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }

      if (savedHidePref) {
        setHideSampleData(true);
      }

      if (savedBankTx) {
        try {
          setBankTransactions(JSON.parse(savedBankTx));
          if (savedBankAcc) {
            setConnectedAccount(JSON.parse(savedBankAcc));
          }
        } catch {}
      } else if (!savedHidePref && !hideBankMock) {
        setConnectedAccount(tinkClient.getMockSandboxAccounts('handelsbanken')[0]);
        setBankTransactions(tinkClient.getMockSandboxTransactions('acc-handelsbanken-main'));
      }
    }

    // Load initial data from database (Neon / Postgres)
    fetch(`/api/receipts?includeSample=${!savedHidePref}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.receipts) {
          setReceipts(data.receipts);
          setIsSampleDataActive(Boolean(data.isSample));
        }
      })
      .catch((err) => console.warn('Note on loading receipts:', err));

    fetch(`/api/invoices?includeSample=${!savedHidePref}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) {
          setInvoices(data.invoices);
        }
      })
      .catch((err) => console.warn('Note on loading invoices:', err));

    // Check active Neon user session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          loadUserData(data.user.id, savedHidePref);
          setBusinessConfig((prev) => ({
            ...prev,
            companyName: data.user.company_name || prev.companyName,
            companyType: data.user.company_type || prev.companyType,
            orgNr: data.user.org_nr || prev.orgNr,
            hasFSkatt: data.user.has_f_skatt ?? prev.hasFSkatt,
            vatPeriod: data.user.vat_period || prev.vatPeriod,
            estimatedYearlyRevenue: data.user.estimated_yearly_revenue || prev.estimatedYearlyRevenue,
            municipalTaxRate: data.user.municipal_tax_rate || prev.municipalTaxRate,
            bankgiro: data.user.bankgiro || prev.bankgiro,
            swishNumber: data.user.swish_number || prev.swishNumber,
          }));
        }
      })
      .catch((err) => console.warn('Auth session check note:', err));
  }, []);

  // Public Landing Page View Mode
  if (activeView === 'landing') {
    return (
      <div className="relative">
        <LandingPage
          onEnterApp={() => setActiveView('overview')}
          onOpenDemoTour={() => {
            setActiveView('overview');
            setIsDemoTourOpen(true);
          }}
        />
        {/* Floating Quick Return Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1c1917] text-white shadow-xl hover:bg-[#292524] transition active:scale-95 font-bold text-sm border border-[#e7e2d7] cursor-pointer"
          >
            <span>Öppna Cockpit</span>
            <span className="text-[#f59e0b]">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1917] flex font-sans selection:bg-amber-200 selection:text-[#1c1917]">
      
      {/* 1. Left Navigation Sidebar (Stripe / Linear style) */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        companyType={businessConfig.companyType}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
        onSwitchCompanyType={(newType) => {
          const updated: BusinessConfig = {
            ...businessConfig,
            companyType: newType,
            companyName: newType === 'aktiebolag' ? 'Nordic Tech Solutions AB' : 'Mohak Konsulting EF',
            orgNr: newType === 'aktiebolag' ? '559123-4567' : '19890412-1234',
          };
          handleSaveBusinessConfig(updated);
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
        onOpenKivra={() => setIsKivraOpen(true)}
        onOpenEmailForwarding={() => setIsEmailForwardingOpen(true)}
        onOpenSettings={() => setIsOnboardingOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onExportSIE={handleExportSIE}
        receiptsCount={filteredReceipts.length}
        invoicesCount={filteredInvoices.length}
        missingBankReceiptsCount={missingBankReceiptsCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
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
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-28 lg:pb-8">
          
          {/* Sample Data Notice Banner (Option 3) */}
          {isSampleDataActive && !hideSampleData && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-amber-900">Du visar exempeldata (starter demo).</span>{' '}
                  <span className="text-amber-800">
                    {currentUser ? `Ditt konto (${currentUser.email}) har inga egna verifikat i databasen än.` : 'Logga in för att spara dina egna kvitton & fakturor.'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={handleClearSampleData}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1c1917] text-white hover:bg-[#292524] transition text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Börja från noll (0 kr)</span>
                </button>
              </div>
            </div>
          )}

          {/* Clean Slate Confirmation Banner */}
          {hideSampleData && receipts.length === 0 && invoices.length === 0 && (
            <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-[#e7e2d7] text-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#e7e2d7] flex items-center justify-center shrink-0 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-stone-900">Rent konto (0 kr i bokföring).</span>{' '}
                  <span className="text-stone-600">Ladda upp ditt första kvitto eller skapa en faktura för att komma igång.</span>
                </div>
              </div>
              <button
                onClick={handleRestoreSampleData}
                className="px-3.5 py-1.5 rounded-lg border border-[#e7e2d7] bg-white text-stone-700 hover:bg-stone-100 transition text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Visa exempeldata igen</span>
              </button>
            </div>
          )}
          
          {/* View 1: Översikt (Cockpit) */}
          {activeView === 'overview' && (
            <OverviewView
              taxBuffer={taxBuffer}
              companyType={businessConfig.companyType}
              receipts={filteredReceipts}
              invoices={filteredInvoices}
              bankTransactions={bankTransactions}
              onNavigateToExpenses={() => setActiveView('expenses')}
              onNavigateToInvoices={() => setActiveView('invoices')}
              onNavigateToTax={() => setActiveView('tax')}
              onNavigateToBank={() => setActiveView('bank')}
              onOpenUpload={() => handleOpenUpload('default')}
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
                onUpdateReceiptDate={handleUpdateReceiptDate}
                onExportSIE={handleExportSIE}
                onOpenUpload={() => handleOpenUpload('default')}
                onOpenCamera={() => handleOpenUpload('camera')}
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
                receipts={filteredReceipts}
                invoices={filteredInvoices}
                companyType={businessConfig.companyType}
                onOpenUpload={(mode = 'default') => handleOpenUpload(mode)}
                onOpenConnectBank={() => setIsOpenBankingOpen(true)}
                onSyncTransactions={handleSyncTransactions}
                onUpdateTransaction={handleUpdateTransaction}
                onAddReceipt={handleReceiptAdded}
                onClearBankData={handleClearBankData}
                onImportCsvTransactions={handleImportCsvTransactions}
                onLoadDemoBankData={handleLoadDemoBankData}
              />
            </div>
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#e7e2d7] bg-white py-6 text-center text-xs text-stone-500 mt-auto pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Klaro — Automatiserad skattebuffert & fakturering för svenska företagare.</span>
            <span className="font-mono text-stone-400">SIE-4 Standard • Skatteverket 2026 • F-skatt</span>
          </div>
        </footer>

      </div>

      {/* 3. Mobile Thumb-Friendly Navigation Bottom Bar */}
      <MobileBottomNav
        activeView={activeView}
        onSelectView={setActiveView}
        receiptsCount={filteredReceipts.length}
        invoicesCount={filteredInvoices.length}
        missingBankReceiptsCount={missingBankReceiptsCount}
        onOpenUpload={() => handleOpenUpload('default')}
        onOpenCamera={() => handleOpenUpload('camera')}
        onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
        onSyncBank={handleSyncTransactions}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* Modals & Dialogs */}
      <ReceiptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onReceiptAdded={handleReceiptAdded}
        initialMode={uploadModalMode}
      />

      <InvoiceBuilderModal
        isOpen={isInvoiceBuilderOpen}
        onClose={() => setIsInvoiceBuilderOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
        bankgiro={businessConfig.bankgiro}
        swishNumber={businessConfig.swishNumber}
        hasFSkatt={businessConfig.hasFSkatt}
      />

      <InvoicePreviewModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
        companyName={businessConfig.companyName}
        orgNr={businessConfig.orgNr}
        bankgiro={businessConfig.bankgiro}
        swishNumber={businessConfig.swishNumber}
        hasFSkatt={businessConfig.hasFSkatt}
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
        onComplete={handleSaveBusinessConfig}
      />

      <KivraInboxModal
        isOpen={isKivraOpen}
        onClose={() => setIsKivraOpen(false)}
        onImportReceipt={handleReceiptAdded}
        userId={currentUser?.id || '00000000-0000-0000-0000-000000000001'}
        userEmail={currentUser?.email || 'mohakay73@gmail.com'}
        existingReceipts={receipts}
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
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user) {
            loadUserData(user.id);
            setBusinessConfig((prev) => ({
              ...prev,
              companyName: user.company_name || prev.companyName,
              companyType: user.company_type || prev.companyType,
              orgNr: user.org_nr || prev.orgNr,
              hasFSkatt: user.has_f_skatt ?? prev.hasFSkatt,
              vatPeriod: user.vat_period || prev.vatPeriod,
              estimatedYearlyRevenue: user.estimated_yearly_revenue || prev.estimatedYearlyRevenue,
              municipalTaxRate: user.municipal_tax_rate || prev.municipalTaxRate,
              bankgiro: user.bankgiro || prev.bankgiro,
              swishNumber: user.swish_number || prev.swishNumber,
            }));
          } else {
            setInvoices(INITIAL_INVOICES);
            setReceipts(INITIAL_RECEIPTS);
          }
        }}
      />

      {/* Interactive 60s Demo Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        activeView={activeView}
        onSelectView={setActiveView}
        onLoadScenario={handleLoadScenario}
        onResetDemoData={handleResetDemoData}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
        onOpenPayMoms={() => setIsPayMomsOpen(true)}
        onOpenDeclaration={() => setIsDeclarationOpen(true)}
      />

    </div>
  );
}
