-- Setup database for JSC Asset Management System

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS asset_audit_logs CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS asset_transfers CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS asset_category CASCADE;
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'asset_manager', 'department_head', 'staff');
CREATE TYPE asset_status AS ENUM ('active', 'maintenance', 'retired', 'disposed');
CREATE TYPE asset_category AS ENUM ('computers', 'printers', 'furniture', 'legal_materials', 'other');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'completed', 'rejected');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    department TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_id TEXT NOT NULL UNIQUE,
    asset_name TEXT NOT NULL,
    description TEXT,
    category asset_category NOT NULL,
    serial_number TEXT,
    model TEXT,
    manufacturer TEXT,
    purchase_date TIMESTAMP,
    purchase_cost DECIMAL(10,2),
    warranty_expiry TIMESTAMP,
    current_location TEXT NOT NULL,
    assigned_department TEXT NOT NULL,
    assigned_user_id INTEGER REFERENCES users(id),
    status asset_status NOT NULL DEFAULT 'active',
    condition TEXT NOT NULL DEFAULT 'good',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Asset transfers table
CREATE TABLE asset_transfers (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    from_department TEXT NOT NULL,
    to_department TEXT NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    reason TEXT NOT NULL,
    status transfer_status NOT NULL DEFAULT 'pending',
    requested_by_id INTEGER NOT NULL REFERENCES users(id),
    approved_by_id INTEGER REFERENCES users(id),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Maintenance schedules table
CREATE TABLE maintenance_schedules (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP NOT NULL,
    completed_date TIMESTAMP,
    status maintenance_status NOT NULL DEFAULT 'scheduled',
    performed_by TEXT,
    cost DECIMAL(10,2),
    notes TEXT,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Asset audit logs table
CREATE TABLE asset_audit_logs (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    action TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    performed_by_id INTEGER NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_assigned_user ON assets(assigned_user_id);
CREATE INDEX idx_transfers_status ON asset_transfers(status);
CREATE INDEX idx_maintenance_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX idx_audit_logs_timestamp ON asset_audit_logs(timestamp);
CREATE INDEX idx_audit_logs_asset_id ON asset_audit_logs(asset_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_transfers_updated_at BEFORE UPDATE ON asset_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON maintenance_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
