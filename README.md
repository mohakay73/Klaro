# Klaro — Hyper-Localized Swedish Freelance Financial & Tax Buffer Engine

**Klaro** is an AI-powered financial relief application engineered specifically for Swedish sole traders (*enskild firma*) and micro-corporations (*aktiebolag*).

It automates receipt and invoice ingestion, uses AI to strictly parse Swedish VAT (*moms*) according to Skatteverkets rules, and calculates a real-time **Safe to Spend / Tax Buffer** so freelancers never experience unexpected tax bills (*kvarskatt*).

---

## 🇸🇪 Swedish Tax Logic & Compliance

In Sweden, freelancers frequently suffer from tax surprises due to mixing preliminary income tax, self-employment social security fees (*egenavgifter*), and output/input VAT (*moms*). Klaro eliminates this guesswork:

### 1. Moms (VAT) Brackets (Mervärdesskattelagen)
- **25% (Standard)**: IT consulting, software, SaaS subscriptions, hardware, telephony, legal fees, general business services. (*Ruta 05 i Momsdeklarationen*)
- **12% (Livsmedel & Logi)**: Restaurant visits with clients, representation meals, hotel stays during business travel. (*Ruta 06*)
- **6% (Persontransport & Kultur)**: Inrikes tågresor (SJ), lokaltrafik (SL), taxi (Taxi Stockholm, Uber, Bolt), facklitteratur & tidningar. (*Ruta 07*)
- **0% (Momsfritt / Omvänd skattskyldighet)**: Finansiella avgifter, Stripe/Klarna transaktionskostnader, bankavgifter, friskvård, utländska B2B programvaror med EU reverse charge. (*Ruta 08*)

### 2. Enskild Firma Tax Reserves (Skatteverket)
1. **Schablonavdrag (25%)**: Skatteverket grants a 25% standard deduction on net profit before calculating social security contributions.
2. **Egenavgifter (28.97%)**: Self-employment social security fees applied to net profit after the 25% schablonavdrag (effective rate ~21.7% of gross profit).
3. **Kommunalskatt (~32%)**: Municipal income tax estimated on remaining profit after social security contributions.
4. **Total F-skatt Reserv**: Klaro reserves 40–43% of net profit for preliminary tax & social security fees.
5. **Safe to Spend (*Säkert att ta ut*)**:
   $$\text{Safe to Spend} = \text{Net Profit (exkl moms)} - \text{F-skatt Reserve} - \text{Netto Moms (om positiv)}$$
   Money that can be safely transferred to a private bank account (*eget uttag*) with zero fear of Skatteverket tax debts.

---

## 🛠️ Tech Stack Constraints & Architecture

- **Frontend & Backend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **AI Parsing**: OpenAI GPT-4o-mini / Anthropic Claude 3.5 structured JSON output + fallback Swedish heuristic rule engine
- **Inbound Email**: Resend Webhooks (for receipt email forwarding)

---

## 🗄️ Database Schema Reference (PostgreSQL + RLS)

Located at `supabase/schema.sql`:

```sql
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  company_name text,
  vat_registered boolean default true,
  vat_period text check (vat_period in ('monthly', 'quarterly', 'yearly')) default 'quarterly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Receipts Table (Expenses & Ingående moms)
create table public.receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_file_url text,
  source_type text check (source_type in ('email_forward', 'web_upload', 'mobile_scan')) not null,
  vendor_name text not null,
  invoice_date date not null,
  currency text default 'SEK' not null,
  total_amount numeric(12, 2) not null,
  vat_amount numeric(12, 2) not null,
  vat_rate numeric(5, 2) not null check (vat_rate in (0, 6, 12, 25)),
  category text not null,
  raw_ai_response jsonb,
  status text check (status in ('parsed', 'verified', 'exported')) default 'parsed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Invoices Table (Revenue & Utgående moms)
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  customer_name text not null,
  invoice_number text,
  invoice_date date not null,
  due_date date,
  currency text default 'SEK' not null,
  subtotal_amount numeric(12, 2) not null,
  vat_amount numeric(12, 2) not null,
  total_amount numeric(12, 2) not null,
  vat_rate numeric(5, 2) default 25.00 check (vat_rate in (0, 6, 12, 25)),
  status text check (status in ('draft', 'sent', 'paid', 'overdue')) default 'paid',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.receipts enable row level security;
alter table public.invoices enable row level security;

create policy "Users own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own receipts" on public.receipts for all using (auth.uid() = user_id);
create policy "Users own invoices" on public.invoices for all using (auth.uid() = user_id);
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Parsing (OpenAI or Anthropic)
AI_PROVIDER=openai # or anthropic
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Resend Inbound Email Webhook
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📬 Inbound Email Ingestion (Resend Webhook)

Endpoint: `/api/webhooks/resend`
- Allows freelancers to forward invoice emails or receipt attachments directly to their Klaro inbox (e.g. `kvitton+demo@klaro.se`).
- Extracts attachments or body text, runs Swedish AI tax parsing, and inserts into `receipts` with `source_type: 'email_forward'`.

---

## ⚡ Quick Testing of Swedish VAT Brackets

In the UI, click **"Tolka Kvitto (AI)"** to test 4 built-in 1-click presets:
1. **SJ Tågbiljett (6% moms)**: Domestic transport (BAS 5800)
2. **Espresso House Fika (12% moms)**: Representation meal (BAS 6072)
3. **Adobe Creative Cloud (25% moms)**: Software/SaaS license (BAS 5420)
4. **Stripe Avgifter (0% moms)**: Exempt financial services (BAS 6570)
