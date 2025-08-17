-- Complete Vehicle Maintenance System - Production Migration
-- This single migration creates the entire system from scratch
-- Version: 1.0.0 - Production Ready

-- =====================================================
-- 1. CORE MAINTENANCE SYSTEM TABLES
-- =====================================================

-- Main maintenance requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  contact_number text NOT NULL,
  company_name text,
  total_cost numeric NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'emergency', 'preventive', 'repair')),
  estimated_completion text,
  notes text,
  assigned_to text,
  technician_notes text,
  company_id uuid,
  supervisor_id uuid,
  supervisor_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicle details for each maintenance request
CREATE TABLE IF NOT EXISTS maintenance_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  plate_number text NOT NULL,
  model text,
  year integer,
  mileage integer,
  issue_description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. COMPANY MANAGEMENT SYSTEM
-- =====================================================

-- Companies table for multi-tenant support
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text UNIQUE,
  contact_email text,
  contact_phone text,
  address text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Supervisor profiles linked to companies
CREATE TABLE IF NOT EXISTS supervisor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for company associations
ALTER TABLE maintenance_requests 
ADD CONSTRAINT fk_maintenance_requests_company 
FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE maintenance_requests 
ADD CONSTRAINT fk_maintenance_requests_supervisor 
FOREIGN KEY (supervisor_id) REFERENCES supervisor_profiles(id);

-- =====================================================
-- 3. TIMELINE TRACKING SYSTEM
-- =====================================================

-- Timeline milestones for tracking progress
CREATE TABLE IF NOT EXISTS maintenance_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (milestone_type IN ('major', 'minor', 'event', 'deadline')),
  title text NOT NULL,
  description text,
  planned_date timestamptz,
  actual_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_to text,
  created_by text NOT NULL,
  created_by_role text NOT NULL CHECK (created_by_role IN ('admin', 'supervisor', 'technician')),
  order_index integer DEFAULT 0,
  is_critical boolean DEFAULT false,
  dependencies jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Timeline events for additional tracking
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('call', 'meeting', 'issue', 'note', 'delay', 'escalation')),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  created_by text NOT NULL,
  created_by_role text NOT NULL CHECK (created_by_role IN ('admin', 'supervisor', 'technician')),
  is_flagged boolean DEFAULT false,
  flag_color text DEFAULT 'blue' CHECK (flag_color IN ('green', 'blue', 'yellow', 'red')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. PERFORMANCE INDEXES
-- =====================================================

-- Maintenance requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_company_id ON maintenance_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_supervisor_id ON maintenance_requests(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at);

-- Vehicle indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicles_request_id ON maintenance_vehicles(request_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicles_plate_number ON maintenance_vehicles(plate_number);

-- Company indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- Supervisor indexes
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_company_id ON supervisor_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_email ON supervisor_profiles(email);
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_active ON supervisor_profiles(is_active);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_timeline_request_id ON maintenance_timeline(request_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_timeline_status ON maintenance_timeline(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_timeline_order ON maintenance_timeline(request_id, order_index);

CREATE INDEX IF NOT EXISTS idx_timeline_events_request_id ON timeline_events(request_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_date);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Open access policies (simplified for multi-role system)
CREATE POLICY "Open access for maintenance_requests" ON maintenance_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open access for maintenance_vehicles" ON maintenance_vehicles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open access for companies" ON companies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open access for supervisor_profiles" ON supervisor_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open access for maintenance_timeline" ON maintenance_timeline FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Open access for timeline_events" ON timeline_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 6. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER supervisor_profiles_updated_at BEFORE UPDATE ON supervisor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER maintenance_timeline_updated_at BEFORE UPDATE ON maintenance_timeline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create timeline milestones for new requests
CREATE OR REPLACE FUNCTION create_default_timeline_milestones()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO maintenance_timeline (request_id, milestone_type, title, description, order_index, is_critical, created_by, created_by_role)
  VALUES 
    (NEW.id, 'major', 'Initial Inspection', 'Perform comprehensive vehicle inspection and diagnostic assessment', 1, true, 'system', 'admin'),
    (NEW.id, 'major', 'Parts Procurement', 'Order and receive all necessary parts and materials', 2, true, 'system', 'admin'),
    (NEW.id, 'major', 'Repair/Maintenance Work', 'Execute primary maintenance and repair tasks', 3, true, 'system', 'admin'),
    (NEW.id, 'major', 'Testing & Calibration', 'Test all systems and perform calibration as needed', 4, true, 'system', 'admin'),
    (NEW.id, 'major', 'Quality Assurance', 'Final inspection and quality verification', 5, true, 'system', 'admin'),
    (NEW.id, 'minor', 'Delivery Preparation', 'Prepare vehicle for customer delivery', 6, false, 'system', 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_milestones_trigger
  AFTER INSERT ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_default_timeline_milestones();

-- =====================================================
-- 7. SAMPLE DATA FOR PRODUCTION
-- =====================================================

-- Insert sample companies
INSERT INTO companies (name, code, contact_email, contact_phone, description) VALUES
('ABC Transport Company', 'ABC', 'contact@abc-transport.com', '+251911000001', 'Leading transportation and logistics company'),
('XYZ Logistics Ltd', 'XYZ', 'info@xyz-logistics.com', '+251911000002', 'Freight and cargo logistics services'),
('Delta Fleet Services', 'DFS', 'support@deltafleet.com', '+251911000003', 'Fleet management and maintenance services'),
('Omega Shipping Corp', 'OSC', 'admin@omegashipping.com', '+251911000004', 'International shipping and freight forwarding')
ON CONFLICT (name) DO NOTHING;

-- Insert sample supervisor profiles
INSERT INTO supervisor_profiles (name, email, phone, company_id) VALUES
('John Supervisor', 'john@abc-transport.com', '+251911100001', (SELECT id FROM companies WHERE code = 'ABC')),
('Sarah Manager', 'sarah@xyz-logistics.com', '+251911100002', (SELECT id FROM companies WHERE code = 'XYZ')),
('Mike Fleet', 'mike@deltafleet.com', '+251911100003', (SELECT id FROM companies WHERE code = 'DFS')),
('Lisa Operations', 'lisa@omegashipping.com', '+251911100004', (SELECT id FROM companies WHERE code = 'OSC'))
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 8. VERIFICATION AND CLEANUP
-- =====================================================

-- Update any existing requests without company association
UPDATE maintenance_requests
SET
  company_id = (SELECT id FROM companies WHERE code = 'ABC' LIMIT 1),
  supervisor_id = (SELECT id FROM supervisor_profiles WHERE email = 'john@abc-transport.com' LIMIT 1),
  supervisor_name = 'John Supervisor'
WHERE company_id IS NULL;

-- Create default milestones for existing requests that don't have them
INSERT INTO maintenance_timeline (request_id, milestone_type, title, description, order_index, is_critical, created_by, created_by_role)
SELECT
  mr.id,
  'major',
  milestone.title,
  milestone.description,
  milestone.order_index,
  milestone.is_critical,
  'system',
  'admin'
FROM maintenance_requests mr
CROSS JOIN (
  VALUES
    ('Initial Inspection', 'Perform comprehensive vehicle inspection and diagnostic assessment', 1, true),
    ('Parts Procurement', 'Order and receive all necessary parts and materials', 2, true),
    ('Repair/Maintenance Work', 'Execute primary maintenance and repair tasks', 3, true),
    ('Testing & Calibration', 'Test all systems and perform calibration as needed', 4, true),
    ('Quality Assurance', 'Final inspection and quality verification', 5, true),
    ('Delivery Preparation', 'Prepare vehicle for customer delivery', 6, false)
) AS milestone(title, description, order_index, is_critical)
WHERE NOT EXISTS (
  SELECT 1 FROM maintenance_timeline mt WHERE mt.request_id = mr.id
);

-- =====================================================
-- 9. PRODUCTION VERIFICATION QUERIES
-- =====================================================

-- Verify companies and supervisors
-- SELECT
--   c.name as company_name,
--   c.code,
--   COUNT(sp.id) as supervisor_count,
--   COUNT(mr.id) as request_count
-- FROM companies c
-- LEFT JOIN supervisor_profiles sp ON c.id = sp.company_id
-- LEFT JOIN maintenance_requests mr ON c.id = mr.company_id
-- GROUP BY c.id, c.name, c.code
-- ORDER BY c.name;

-- Verify timeline system
-- SELECT
--   mr.owner_name,
--   mr.status as request_status,
--   c.name as company_name,
--   COUNT(mt.id) as milestone_count
-- FROM maintenance_requests mr
-- LEFT JOIN companies c ON mr.company_id = c.id
-- LEFT JOIN maintenance_timeline mt ON mr.id = mt.request_id
-- GROUP BY mr.id, mr.owner_name, mr.status, c.name
-- ORDER BY mr.created_at DESC;

-- =====================================================
-- MIGRATION COMPLETE - PRODUCTION READY
-- =====================================================
