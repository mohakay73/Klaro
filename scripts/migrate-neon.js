const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xsFtMZoh2c7P@ep-still-mountain-b9z4nfql-pooler.c-7.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  console.log('Creating uuid extension...');
  await sql.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  console.log('Creating profiles table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      company_name TEXT DEFAULT 'Mitt Företag',
      company_type TEXT CHECK (company_type IN ('enskild_firma', 'aktiebolag')) DEFAULT 'enskild_firma',
      org_nr TEXT DEFAULT '559123-4567',
      has_f_skatt BOOLEAN DEFAULT true,
      vat_registered BOOLEAN DEFAULT true,
      vat_period TEXT CHECK (vat_period IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'quarterly',
      tax_estimate_rate NUMERIC(5, 2) DEFAULT 43.00,
      estimated_yearly_revenue NUMERIC(12, 2) DEFAULT 950000,
      municipal_tax_rate NUMERIC(5, 4) DEFAULT 0.3200,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Creating receipts table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS receipts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      original_file_url TEXT,
      source_type TEXT CHECK (source_type IN ('email_forward', 'web_upload', 'mobile_scan')) NOT NULL,
      vendor_name TEXT NOT NULL,
      invoice_date DATE NOT NULL,
      currency TEXT DEFAULT 'SEK' NOT NULL,
      total_amount NUMERIC(12, 2) NOT NULL,
      vat_amount NUMERIC(12, 2) NOT NULL,
      vat_rate NUMERIC(5, 2) NOT NULL CHECK (vat_rate IN (0, 6, 12, 25)),
      category TEXT NOT NULL,
      bas_account TEXT,
      raw_ai_response JSONB,
      status TEXT CHECK (status IN ('parsed', 'verified', 'exported')) DEFAULT 'parsed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Creating indexes on receipts...');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON receipts (user_id, invoice_date DESC);');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts (user_id, status);');

  console.log('Creating invoices table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      invoice_number TEXT,
      invoice_date DATE NOT NULL,
      due_date DATE,
      currency TEXT DEFAULT 'SEK' NOT NULL,
      subtotal_amount NUMERIC(12, 2) NOT NULL,
      vat_amount NUMERIC(12, 2) NOT NULL,
      total_amount NUMERIC(12, 2) NOT NULL,
      vat_rate NUMERIC(5, 2) DEFAULT 25.00 CHECK (vat_rate IN (0, 6, 12, 25)),
      status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'paid',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Creating indexes on invoices...');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_invoices_user_date ON invoices (user_id, invoice_date DESC);');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (user_id, status);');

  console.log('Seeding default demo profile...');
  await sql.query(`
    INSERT INTO profiles (id, email, company_name, company_type, org_nr, has_f_skatt, vat_registered, vat_period)
    VALUES ('00000000-0000-0000-0000-000000000001', 'demo@klaro.se', 'Lindqvist Digital Design (Enskild Firma)', 'enskild_firma', '559123-4567', true, true, 'quarterly')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('Checking tables in Neon...');
  const tables = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('Successfully migrated Neon database! Tables:', tables.map(t => t.table_name));
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
