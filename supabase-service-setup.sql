-- =========================================================
-- Neo Tokyo RMA — Service Tickets Table
-- Run this in your Supabase SQL Editor AFTER the main setup
-- =========================================================

-- SERVICE TICKETS TABLE
CREATE TABLE IF NOT EXISTS service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL,
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  assigned_engineer TEXT,
  invoice_bill_no TEXT,
  date_of_purchase DATE,
  received_date DATE,
  company_name TEXT,
  product_type TEXT,
  model TEXT,
  serial_number TEXT,
  system_config TEXT,
  os TEXT,
  service_type TEXT,
  cabinet_details TEXT,
  reported_issues TEXT,
  actions_taken TEXT,
  call_status TEXT DEFAULT 'Open',
  custom_status TEXT,
  received_items TEXT,
  customer_comments TEXT,
  linked_rma_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(call_status);
CREATE INDEX IF NOT EXISTS idx_service_tickets_number ON service_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_service_tickets_created ON service_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_tickets_engineer ON service_tickets(assigned_engineer);

-- ROW LEVEL SECURITY
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on service_tickets" ON service_tickets FOR ALL USING (true) WITH CHECK (true);

-- ADD ASSIGNMENT HISTORY COLUMN (run if table already exists)
-- ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS assignment_history JSONB DEFAULT '[]';
