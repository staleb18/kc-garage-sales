-- KC Garage Sales Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Garage Sales table
create table garage_sales (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  title text not null,
  description text,
  address text not null,
  city text not null,
  state text not null check (state in ('KS', 'MO')),
  zip_code text not null,
  latitude double precision not null,
  longitude double precision not null,
  start_date date not null,
  end_date date not null,
  start_time time not null,
  end_time time not null,
  categories text[] default '{}',
  photos text[] default '{}',
  is_verified boolean default false,
  is_featured boolean default false,
  verification_token uuid default uuid_generate_v4(),
  edit_token uuid default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Ensure end_date is on or after start_date
  constraint valid_date_range check (end_date >= start_date)
);

-- Create index for faster geo queries
create index idx_garage_sales_location on garage_sales (latitude, longitude);

-- Create index for date filtering
create index idx_garage_sales_dates on garage_sales (start_date, end_date);

-- Create index for verified sales
create index idx_garage_sales_verified on garage_sales (is_verified) where is_verified = true;

-- Row Level Security
alter table garage_sales enable row level security;

-- Policy: Anyone can read verified sales
create policy "Public can view verified sales"
  on garage_sales for select
  using (is_verified = true and end_date >= current_date);

-- Policy: Anyone can insert (will be unverified until email confirmed)
create policy "Anyone can create a sale"
  on garage_sales for insert
  with check (true);

-- Policy: Can update own sale with edit token (handled via service key)
-- Policy: Can delete own sale with edit token (handled via service key)

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_garage_sales_updated_at
  before update on garage_sales
  for each row
  execute function update_updated_at_column();

-- Email subscribers table (for "notify me of new sales" feature)
create table email_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  zip_codes text[] default '{}',
  categories text[] default '{}',
  is_verified boolean default false,
  verification_token uuid default uuid_generate_v4(),
  unsubscribe_token uuid default uuid_generate_v4(),
  created_at timestamp with time zone default now()
);

-- Index for subscriber lookups
create index idx_subscribers_email on email_subscribers (email);
create index idx_subscribers_verified on email_subscribers (is_verified) where is_verified = true;

-- Row Level Security for subscribers
alter table email_subscribers enable row level security;

-- Policy: Service key handles all subscriber operations
create policy "Service manages subscribers"
  on email_subscribers for all
  using (true)
  with check (true);

-- Storage bucket for sale photos (run in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('sale-photos', 'sale-photos', true);
