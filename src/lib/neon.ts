import { neon } from '@neondatabase/serverless';
import { Receipt, Invoice, Profile } from '@/types/database';
import { PSD2Transaction } from '@/lib/open-banking/types';

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return neon(databaseUrl);
}

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Fetch all receipts for a user (or default user)
 */
export async function getReceiptsFromNeon(userId: string = DEFAULT_USER_ID): Promise<Receipt[]> {
  try {
    const sql = getDb();
    const rows = await sql.query(
      `SELECT * FROM receipts WHERE user_id = $1 ORDER BY created_at DESC, invoice_date DESC;`,
      [userId]
    );

    return rows.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      original_file_url: r.original_file_url,
      source_type: r.source_type,
      vendor_name: r.vendor_name,
      invoice_date: r.invoice_date instanceof Date ? r.invoice_date.toISOString().split('T')[0] : String(r.invoice_date),
      currency: r.currency || 'SEK',
      total_amount: Number(r.total_amount),
      vat_amount: Number(r.vat_amount),
      vat_rate: Number(r.vat_rate) as any,
      category: r.category,
      bas_account: r.bas_account,
      raw_ai_response: r.raw_ai_response,
      status: r.status,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));
  } catch (error) {
    console.error('Error fetching receipts from Neon:', error);
    return [];
  }
}

/**
 * Insert a receipt into Neon
 */
export async function insertReceiptIntoNeon(receipt: Partial<Receipt>): Promise<Receipt> {
  const sql = getDb();
  const userId = receipt.user_id || DEFAULT_USER_ID;

  const rows = await sql.query(
    `INSERT INTO receipts (
      user_id, original_file_url, source_type, vendor_name,
      invoice_date, currency, total_amount, vat_amount,
      vat_rate, category, bas_account, raw_ai_response, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;`,
    [
      userId,
      receipt.original_file_url || null,
      receipt.source_type || 'web_upload',
      receipt.vendor_name || 'Okänd leverantör',
      receipt.invoice_date || new Date().toISOString().split('T')[0],
      receipt.currency || 'SEK',
      receipt.total_amount || 0,
      receipt.vat_amount || 0,
      receipt.vat_rate || 25,
      receipt.category || 'Övrigt',
      receipt.bas_account || null,
      receipt.raw_ai_response ? JSON.stringify(receipt.raw_ai_response) : null,
      receipt.status || 'parsed',
    ]
  );

  const r = rows[0];
  return {
    id: r.id,
    user_id: r.user_id,
    original_file_url: r.original_file_url,
    source_type: r.source_type,
    vendor_name: r.vendor_name,
    invoice_date: r.invoice_date instanceof Date ? r.invoice_date.toISOString().split('T')[0] : String(r.invoice_date),
    currency: r.currency || 'SEK',
    total_amount: Number(r.total_amount),
    vat_amount: Number(r.vat_amount),
    vat_rate: Number(r.vat_rate) as any,
    category: r.category,
    bas_account: r.bas_account,
    raw_ai_response: r.raw_ai_response,
    status: r.status,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  };
}

/**
 * Delete a receipt from Neon
 */
export async function deleteReceiptFromNeon(id: string, userId?: string): Promise<boolean> {
  try {
    const sql = getDb();
    if (userId && userId !== DEFAULT_USER_ID) {
      await sql.query(
        `DELETE FROM receipts WHERE id = $1 AND user_id = $2;`,
        [id, userId]
      );
    } else {
      await sql.query(
        `DELETE FROM receipts WHERE id = $1;`,
        [id]
      );
    }
    return true;
  } catch (error) {
    console.error('Error deleting receipt from Neon:', error);
    return false;
  }
}

/**
 * Update a receipt in Neon
 */
export async function updateReceiptInNeon(
  id: string,
  updates: Partial<Receipt>,
  userId?: string
): Promise<boolean> {
  try {
    const sql = getDb();
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.invoice_date !== undefined) {
      sets.push(`invoice_date = $${idx++}`);
      values.push(updates.invoice_date);
    }
    if (updates.vendor_name !== undefined) {
      sets.push(`vendor_name = $${idx++}`);
      values.push(updates.vendor_name);
    }
    if (updates.vat_rate !== undefined) {
      sets.push(`vat_rate = $${idx++}`);
      values.push(updates.vat_rate);
    }
    if (updates.vat_amount !== undefined) {
      sets.push(`vat_amount = $${idx++}`);
      values.push(updates.vat_amount);
    }
    if (updates.category !== undefined) {
      sets.push(`category = $${idx++}`);
      values.push(updates.category);
    }
    if (updates.bas_account !== undefined) {
      sets.push(`bas_account = $${idx++}`);
      values.push(updates.bas_account);
    }

    if (sets.length === 0) return true;

    values.push(id);
    if (userId && userId !== DEFAULT_USER_ID) {
      values.push(userId);
      await sql.query(
        `UPDATE receipts SET ${sets.join(', ')} WHERE id = $${idx++} AND user_id = $${idx++};`,
        values
      );
    } else {
      await sql.query(
        `UPDATE receipts SET ${sets.join(', ')} WHERE id = $${idx++};`,
        values
      );
    }
    return true;
  } catch (error) {
    console.error('Error updating receipt in Neon:', error);
    return false;
  }
}

/**
 * Fetch all invoices for a user
 */
export async function getInvoicesFromNeon(userId: string = DEFAULT_USER_ID): Promise<Invoice[]> {
  try {
    const sql = getDb();
    const rows = await sql.query(
      `SELECT * FROM invoices WHERE user_id = $1 ORDER BY invoice_date DESC, created_at DESC;`,
      [userId]
    );

    return rows.map((inv: any) => ({
      id: inv.id,
      user_id: inv.user_id,
      customer_name: inv.customer_name,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date instanceof Date ? inv.invoice_date.toISOString().split('T')[0] : String(inv.invoice_date),
      due_date: inv.due_date instanceof Date ? inv.due_date.toISOString().split('T')[0] : inv.due_date ? String(inv.due_date) : undefined,
      currency: inv.currency || 'SEK',
      subtotal_amount: Number(inv.subtotal_amount),
      vat_amount: Number(inv.vat_amount),
      total_amount: Number(inv.total_amount),
      vat_rate: Number(inv.vat_rate) as any,
      status: inv.status,
      created_at: inv.created_at instanceof Date ? inv.created_at.toISOString() : String(inv.created_at),
    }));
  } catch (error) {
    console.error('Error fetching invoices from Neon:', error);
    return [];
  }
}

/**
 * Insert an invoice into Neon
 */
export async function insertInvoiceIntoNeon(invoice: Partial<Invoice>): Promise<Invoice> {
  const sql = getDb();
  const userId = invoice.user_id || DEFAULT_USER_ID;

  const rows = await sql.query(
    `INSERT INTO invoices (
      user_id, customer_name, invoice_number, invoice_date,
      due_date, currency, subtotal_amount, vat_amount,
      total_amount, vat_rate, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;`,
    [
      userId,
      invoice.customer_name || 'Kund AB',
      invoice.invoice_number || `FAKTURA-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      invoice.invoice_date || new Date().toISOString().split('T')[0],
      invoice.due_date || null,
      invoice.currency || 'SEK',
      invoice.subtotal_amount || 0,
      invoice.vat_amount || 0,
      invoice.total_amount || 0,
      invoice.vat_rate || 25,
      invoice.status || 'paid',
    ]
  );

  const inv = rows[0];
  return {
    id: inv.id,
    user_id: inv.user_id,
    customer_name: inv.customer_name,
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date instanceof Date ? inv.invoice_date.toISOString().split('T')[0] : String(inv.invoice_date),
    due_date: inv.due_date instanceof Date ? inv.due_date.toISOString().split('T')[0] : inv.due_date ? String(inv.due_date) : undefined,
    currency: inv.currency || 'SEK',
    subtotal_amount: Number(inv.subtotal_amount),
    vat_amount: Number(inv.vat_amount),
    total_amount: Number(inv.total_amount),
    vat_rate: Number(inv.vat_rate) as any,
    status: inv.status,
    created_at: inv.created_at instanceof Date ? inv.created_at.toISOString() : String(inv.created_at),
  };
}

/**
 * Fetch or create a user profile by email
 */
export async function getOrCreateNeonProfile(email: string, companyName?: string): Promise<Profile> {
  const sql = getDb();

  const existing = await sql.query(
    `SELECT * FROM profiles WHERE email = $1;`,
    [email]
  );

  if (existing.length > 0) {
    const p = existing[0];
    return {
      id: p.id,
      email: p.email,
      company_name: p.company_name,
      vat_registered: p.vat_registered,
      vat_period: p.vat_period,
      created_at: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
    };
  }

  const created = await sql.query(
    `INSERT INTO profiles (email, company_name)
     VALUES ($1, $2)
     RETURNING *;`,
    [email, companyName || 'Mitt Företag']
  );

  const p = created[0];
  return {
    id: p.id,
    email: p.email,
    company_name: p.company_name,
    vat_registered: p.vat_registered,
    vat_period: p.vat_period,
    created_at: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
  };
}

/**
 * Fetch all bank transactions for a user from Neon
 */
export async function getBankTransactionsFromNeon(userId: string = DEFAULT_USER_ID): Promise<PSD2Transaction[]> {
  try {
    const sql = getDb();
    const rows = await sql.query(
      `SELECT * FROM bank_transactions WHERE user_id = $1 ORDER BY booking_date DESC, created_at DESC;`,
      [userId]
    );

    return rows.map((r: any) => ({
      id: r.id,
      accountId: r.account_id,
      bookingDate: r.booking_date instanceof Date ? r.booking_date.toISOString().split('T')[0] : String(r.booking_date),
      valueDate: r.value_date instanceof Date ? r.value_date.toISOString().split('T')[0] : String(r.value_date || r.booking_date),
      amount: Number(r.amount),
      currency: r.currency || 'SEK',
      description: r.description,
      merchantName: r.merchant_name || undefined,
      category: r.category || undefined,
      basAccount: r.bas_account || undefined,
      reconciliationStatus: r.reconciliation_status || 'missing_receipt',
      matchedReceiptId: r.matched_receipt_id || undefined,
      matchedInvoiceId: r.matched_invoice_id || undefined,
      matchConfidence: r.match_confidence ? Number(r.match_confidence) : undefined,
      matchReason: r.match_reason || undefined,
      note: r.note || undefined,
      reference: r.reference || undefined,
    }));
  } catch (error) {
    console.error('Error fetching bank transactions from Neon:', error);
    return [];
  }
}

/**
 * Update a bank transaction's reconciliation state in Neon
 */
export async function updateBankTransactionInNeon(
  id: string,
  updates: Partial<PSD2Transaction>,
  userId?: string
): Promise<boolean> {
  try {
    const sql = getDb();
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.reconciliationStatus !== undefined) {
      sets.push(`reconciliation_status = $${idx++}`);
      values.push(updates.reconciliationStatus);
    }
    if (updates.matchedReceiptId !== undefined) {
      sets.push(`matched_receipt_id = $${idx++}`);
      values.push(updates.matchedReceiptId || null);
    }
    if (updates.matchedInvoiceId !== undefined) {
      sets.push(`matched_invoice_id = $${idx++}`);
      values.push(updates.matchedInvoiceId || null);
    }
    if (updates.basAccount !== undefined) {
      sets.push(`bas_account = $${idx++}`);
      values.push(updates.basAccount);
    }
    if (updates.matchConfidence !== undefined) {
      sets.push(`match_confidence = $${idx++}`);
      values.push(updates.matchConfidence);
    }
    if (updates.matchReason !== undefined) {
      sets.push(`match_reason = $${idx++}`);
      values.push(updates.matchReason);
    }
    if (updates.note !== undefined) {
      sets.push(`note = $${idx++}`);
      values.push(updates.note);
    }

    if (sets.length === 0) return true;

    values.push(id);
    if (userId && userId !== DEFAULT_USER_ID) {
      values.push(userId);
      await sql.query(
        `UPDATE bank_transactions SET ${sets.join(', ')} WHERE id = $${idx++} AND user_id = $${idx++};`,
        values
      );
    } else {
      await sql.query(
        `UPDATE bank_transactions SET ${sets.join(', ')} WHERE id = $${idx++};`,
        values
      );
    }
    return true;
  } catch (error) {
    console.error('Error updating bank transaction in Neon:', error);
    return false;
  }
}

/**
 * Upsert bank transactions in batch
 */
export async function upsertBankTransactionsInNeon(
  transactions: PSD2Transaction[],
  userId: string = DEFAULT_USER_ID,
  accountId: string = 'acc-default'
): Promise<void> {
  if (!transactions.length) return;
  const sql = getDb();

  for (const tx of transactions) {
    try {
      await sql.query(
        `INSERT INTO bank_transactions (
          id, user_id, account_id, booking_date, value_date, amount, currency,
          description, merchant_name, category, bas_account, reconciliation_status,
          matched_receipt_id, matched_invoice_id, match_confidence, match_reason, note, reference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          reconciliation_status = EXCLUDED.reconciliation_status,
          matched_receipt_id = EXCLUDED.matched_receipt_id,
          matched_invoice_id = EXCLUDED.matched_invoice_id,
          bas_account = EXCLUDED.bas_account,
          match_confidence = EXCLUDED.match_confidence,
          match_reason = EXCLUDED.match_reason,
          note = EXCLUDED.note;`,
        [
          tx.id,
          userId,
          tx.accountId || accountId,
          tx.bookingDate,
          tx.valueDate || tx.bookingDate,
          tx.amount,
          tx.currency || 'SEK',
          tx.description,
          tx.merchantName || null,
          tx.category || null,
          tx.basAccount || null,
          tx.reconciliationStatus || 'missing_receipt',
          tx.matchedReceiptId || null,
          tx.matchedInvoiceId || null,
          tx.matchConfidence || null,
          tx.matchReason || null,
          tx.note || null,
          tx.reference || null,
        ]
      );
    } catch (err) {
      console.warn('Upsert single tx notice:', err);
    }
  }
}
