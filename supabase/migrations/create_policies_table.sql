-- ==========================================================
-- DFD SPORTS: POLICIES TABLE (Privacy Policy & Delivery Policy)
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('privacy_policy', 'delivery_policy')),
  heading TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- 1. Public can read active policy sections
CREATE POLICY "Public read active policies"
  ON public.policies FOR SELECT
  USING (is_active = true);

-- 2. Authenticated users (admin) manage everything
CREATE POLICY "Admin full access policies"
  ON public.policies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_policies_type_order ON public.policies(policy_type, display_order);
CREATE INDEX IF NOT EXISTS idx_policies_active ON public.policies(is_active);
