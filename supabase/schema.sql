-- ==============================================================================
-- Klaro Database Schema: Swedish Freelance Financial & Tax Buffer Engine
-- Targeting Sole Traders (Enskild Firma) & Micro-AB
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  company_name text,
  company_type text check (company_type in ('enskild_firma', 'aktiebolag')) default 'enskild_firma',
  vat_registered boolean default true,
  vat_period text check (vat_period in ('monthly', 'quarterly', 'yearly')) default 'quarterly',
  tax_estimate_rate numeric(5, 2) default 43.00, -- Standard buffer for kommunalskatt + egenavgifter (schablonavdrag)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Receipts / Expenses Table (Ingående Moms)
create table if not exists public.receipts (
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

-- 3. Sales / Invoices Table (Utgående Moms & Revenue)
create table if not exists public.invoices (
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

-- Indexes for performance
create index if not exists idx_receipts_user_date on public.receipts (user_id, invoice_date desc);
create index if not exists idx_receipts_status on public.receipts (user_id, status);
create index if not exists idx_invoices_user_date on public.invoices (user_id, invoice_date desc);
create index if not exists idx_invoices_status on public.invoices (user_id, status);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.receipts enable row level security;
alter table public.invoices enable row level security;

-- Policies
create policy "Users own profile" 
  on public.profiles for all 
  using (auth.uid() = id);

create policy "Users own receipts" 
  on public.receipts for all 
  using (auth.uid() = user_id);

create policy "Users own invoices" 
  on public.invoices for all 
  using (auth.uid() = user_id);

-- Optional trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, company_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'company_name', 'Mitt Företag'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Storage Bucket for Receipt Files & PDFs
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

create policy "Users can upload receipt files"
on storage.objects for insert
with check (bucket_id = 'receipts');

create policy "Users can read receipt files"
on storage.objects for select
using (bucket_id = 'receipts');

