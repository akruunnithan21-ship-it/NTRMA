-- =========================================================
-- Neo Tokyo RMA — Supabase Database Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================

-- TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rma_number TEXT,
  customer_name TEXT,
  submission_date DATE,
  delivery_date DATE,
  component_type TEXT,
  vendor TEXT,
  component_description TEXT,
  serial_in TEXT,
  serial_out TEXT,
  submitted_to TEXT,
  status TEXT DEFAULT 'Pending',
  rack_location TEXT,
  defect TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET PHOTOS TABLE
CREATE TABLE IF NOT EXISTS ticket_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RACK ITEMS TABLE
CREATE TABLE IF NOT EXISTS rack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  serial TEXT,
  state TEXT DEFAULT 'AT_RACK',
  location TEXT,
  linked_rma TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB
);

-- STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_rma ON tickets(rma_number);
CREATE INDEX IF NOT EXISTS idx_rack_state ON rack_items(state);
CREATE INDEX IF NOT EXISTS idx_photos_ticket ON ticket_photos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_status_history_ticket ON status_history(ticket_id);

-- STORAGE BUCKET (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-photos', 'ticket-photos', true);

-- ROW LEVEL SECURITY (allow all for now — no auth)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Allow public access (since no auth is set up yet)
CREATE POLICY "Allow all on tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ticket_photos" ON ticket_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on rack_items" ON rack_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on status_history" ON status_history FOR ALL USING (true) WITH CHECK (true);



-- =========================================================
-- USER ROLES TABLE (for authentication)
-- =========================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);
