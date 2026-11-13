import { neon } from '@neondatabase/serverless';
import { Receipt, Invoice, Profile } from '@/types/database';

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
      `SELECT * FROM receipts WHERE user_id = $1 ORDER BY invoice_date DESC, created_at DESC;`,
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
export async function deleteReceiptFromNeon(id: string, userId: string = DEFAULT_USER_ID): Promise<boolean> {
  try {
    const sql = getDb();
    await sql.query(
      `DELETE FROM receipts WHERE id = $1 AND user_id = $2;`,
      [id, userId]
    );
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
  userId: string = DEFAULT_USER_ID
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
    values.push(userId);

    await sql.query(
      `UPDATE receipts SET ${sets.join(', ')} WHERE id = $${idx++} AND user_id = $${idx++};`,
      values
    );
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
