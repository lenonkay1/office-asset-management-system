-- assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_id TEXT NOT NULL UNIQUE,
    asset_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    serial_number TEXT,
    model TEXT,
    manufacturer TEXT,
    purchase_date TIMESTAMP,
    purchase_cost DECIMAL(10,2),
    warranty_expiry TIMESTAMP,
    current_location TEXT NOT NULL,
    assignedDepartment TEXT NOT NULL,
    assigned_user_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    condition TEXT NOT NULL DEFAULT 'good',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
