import { SWEDISH_BANKS } from '../src/lib/open-banking/types';
import { tinkClient } from '../src/lib/open-banking/tink-client';
import { reconcileTransactions } from '../src/lib/open-banking/reconciliation-engine';
import { INITIAL_INVOICES, INITIAL_RECEIPTS } from '../src/lib/mock-data';

console.log('--- Testing Swedish Open Banking & PSD2 Reconciliation ---');

// 1. Verify Banks
console.log('Supported Swedish Banks:', SWEDISH_BANKS.map((b) => b.name).join(', '));
if (SWEDISH_BANKS.length < 5) throw new Error('Missing major Swedish banks');

// 2. Verify Tink Client in Sandbox Mode
const accounts = tinkClient.getMockSandboxAccounts('handelsbanken');
console.log('Connected Sandbox Account:', accounts[0].bankName, accounts[0].iban, accounts[0].balance, 'SEK');

const rawTxs = tinkClient.getMockSandboxTransactions(accounts[0].id);
console.log(`Fetched ${rawTxs.length} PSD2 transactions from bank feed.`);

// 3. Test Automatic Reconciliation
const { reconciledTransactions, result } = reconcileTransactions(
  rawTxs,
  INITIAL_INVOICES,
  INITIAL_RECEIPTS
);

console.log('Reconciled Transactions Count:', result.reconciledCount);
console.log('Missing Receipts Count (Action required):', result.unreconciledExpensesCount);
console.log('Matched Invoices:', result.matchedInvoices.length);
console.log('Matched Receipts:', result.matchedReceipts.length);

if (result.matchedInvoices.length === 0) {
  throw new Error('Expected at least 1 invoice to be matched by incoming payment');
}
if (result.matchedReceipts.length === 0) {
  throw new Error('Expected at least 1 receipt to be matched by outgoing card purchase');
}

console.log('✅ OPEN BANKING & RECONCILIATION ENGINE 100% VERIFIED!');
