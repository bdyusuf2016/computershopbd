-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  invoice_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('paid', 'partial', 'due')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  is_color BOOLEAN,
  paper_size TEXT,
  page_count INTEGER
);

-- Online Services table
CREATE TABLE online_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  service_name TEXT NOT NULL,
  application_id TEXT,
  status TEXT CHECK (status IN ('pending', 'submitted', 'processing', 'completed', 'failed')),
  customer_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Office Codes master table (used by Job Application form dropdown)
CREATE TABLE office_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO office_codes (code, name, url) VALUES
  ('BR-01', 'Bangladesh Railway', 'https://railway.gov.bd'),
  ('PR-01', 'Primary Teacher Recruitment', 'https://dpe.gov.bd')
ON CONFLICT (code) DO NOTHING;

-- Inventory table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock_level DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (Income/Expense)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop settings table (single-row app configuration)
CREATE TABLE shop_settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  address TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO shop_settings (id, name, owner, address, mobile, email)
VALUES ('default', 'CompServPro Digital Shop', 'Admin User', '123 Main Street, Dhaka, Bangladesh', '01700000000', 'contact@compservpro.com')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY shop_settings_select_policy ON shop_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY shop_settings_insert_policy ON shop_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY shop_settings_update_policy ON shop_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Role permissions table (role + user type based access control)
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  user_type TEXT CHECK (user_type IN ('owner', 'manager', 'operator')),
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT false,
  can_write BOOLEAN NOT NULL DEFAULT false,
  can_update BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure one permission record per role/user_type/module profile.
CREATE UNIQUE INDEX role_permissions_unique_profile_module
  ON role_permissions (role, COALESCE(user_type, 'admin'), module_id);

-- Enable Row Level Security for role_permissions.
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Development-friendly policies so current client app can read/write with anon/authenticated keys.
-- Tighten these for production with proper user-based conditions.
CREATE POLICY role_permissions_select_policy ON role_permissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY role_permissions_insert_policy ON role_permissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY role_permissions_update_policy ON role_permissions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY role_permissions_delete_policy ON role_permissions
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Per-user permission overrides (stores only user-specific exceptions)
CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT false,
  can_write BOOLEAN NOT NULL DEFAULT false,
  can_update BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX user_permission_overrides_unique_user_module
  ON user_permission_overrides (user_id, module_id);

ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_permission_overrides_select_policy ON user_permission_overrides
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY user_permission_overrides_insert_policy ON user_permission_overrides
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY user_permission_overrides_update_policy ON user_permission_overrides
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY user_permission_overrides_delete_policy ON user_permission_overrides
  FOR DELETE
  TO anon, authenticated
  USING (true);
