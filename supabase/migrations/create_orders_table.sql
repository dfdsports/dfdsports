-- Run this SQL in your Supabase SQL Editor to create the orders table
-- Dashboard → SQL Editor → New Query → paste this → Run

CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  product_name     TEXT NOT NULL,
  category         TEXT,
  quantity         TEXT DEFAULT '1',
  shipping_address TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anon inserts (so the public website can place orders)
CREATE POLICY "Allow anon insert orders"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admin) to read, update, delete
CREATE POLICY "Allow authenticated full access"
  ON public.orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
