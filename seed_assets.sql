-- Example: Insert sample assets
INSERT INTO assets (
    asset_id, asset_name, description, category, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, current_location, assigned_department, assigned_user_id, status, condition, notes, created_at, updated_at
) VALUES
('A001', 'Dell Laptop', 'Office laptop for staff', 'computers', 'SN12345', 'Latitude 5400', 'Dell', '2024-01-15', 1200.00, '2026-01-15', 'Main Office', 'IT', NULL, 'active', 'good', 'No issues', NOW(), NOW()),
('A002', 'HP Printer', 'Color printer for admin', 'printers', 'SN67890', 'LaserJet Pro', 'HP', '2023-06-10', 350.00, '2025-06-10', 'Admin Office', 'Admin', NULL, 'active', 'good', 'Needs toner soon', NOW(), NOW());
