-- =========================================================
-- Neo Tokyo RMA — Onsite & Remote Session Tickets
-- Run this in your Supabase SQL Editor AFTER the main setup
-- =========================================================

-- ONSITE TICKETS TABLE
CREATE TABLE IF NOT EXISTS onsite_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL,
  customer_name TEXT,
  phone TEXT,
  date_time TIMESTAMPTZ,
  complaint TEXT,
  location TEXT,
  technician TEXT,
  status TEXT DEFAULT 'Open',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_onsite_tickets_status ON onsite_tickets(status);
CREATE INDEX IF NOT EXISTS idx_onsite_tickets_number ON onsite_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_onsite_tickets_created ON onsite_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onsite_tickets_technician ON onsite_tickets(technician);

-- ROW LEVEL SECURITY
ALTER TABLE onsite_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on onsite_tickets" ON onsite_tickets FOR ALL USING (true) WITH CHECK (true);


-- REMOTE SESSION TICKETS TABLE
CREATE TABLE IF NOT EXISTS remote_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL,
  customer_name TEXT,
  phone TEXT,
  date_time TIMESTAMPTZ,
  complaint TEXT,
  location TEXT,
  technician TEXT,
  status TEXT DEFAULT 'Open',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_remote_tickets_status ON remote_tickets(status);
CREATE INDEX IF NOT EXISTS idx_remote_tickets_number ON remote_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_remote_tickets_created ON remote_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_remote_tickets_technician ON remote_tickets(technician);

-- ROW LEVEL SECURITY
ALTER TABLE remote_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on remote_tickets" ON remote_tickets FOR ALL USING (true) WITH CHECK (true);
