import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==================== USERS ====================

// Get all users
export async function getAllUsers() {
  const { rows } = await pool.query(
    `SELECT id, username, email, full_name, role, department, is_active, created_at, updated_at 
     FROM users ORDER BY created_at DESC`
  );
  return rows;
}

// Get user by ID
export async function getUser(id: number) {
  const { rows } = await pool.query(
    `SELECT id, username, email, full_name, role, department, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

// Get user by username
export async function getUserByUsername(username: string) {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );
  return rows[0];
}

// Create new user
export async function createUser(user: {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  is_active: boolean;
}) {
  const { username, password, email, full_name, role, department, is_active } = user;

  const { rows } = await pool.query(
    `INSERT INTO users (username, password, email, full_name, role, department, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, username, email, full_name, role, department, is_active, created_at, updated_at`,
    [username, password, email, full_name, role, department, is_active]
  );

  return rows[0];
}

// Update user
export async function updateUser(id: number, data: Partial<{
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  is_active: boolean;
}>) {
  // Only allow updating known columns
  const allowed: (keyof typeof data)[] = [
    "username",
    "password",
    "email",
    "full_name",
    "role",
    "department",
    "is_active",
  ];
  const filtered: Record<string, any> = {};
  for (const key of allowed) {
    if (key in (data || {})) filtered[key] = (data as any)[key];
  }

  const fields = Object.keys(filtered);
  if (fields.length === 0) return null;

  const setQuery = fields.map((f, idx) => `${f} = $${idx + 1}`).join(", ");
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE users SET ${setQuery}, updated_at = NOW() WHERE id = $${fields.length + 1} 
     RETURNING id, username, email, full_name, role, department, is_active, created_at, updated_at`,
    [...values, id]
  );

  return rows[0];
}

// Delete user
export async function deleteUser(id: number) {
  const { rowCount } = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return rowCount > 0;
}

// ==================== ASSETS ====================

export async function getAssets(limit: number, offset: number, _filters: any) {
  // Include next scheduled maintenance date, and derive location/department if missing
  const { rows: assetsRows } = await pool.query(
    `SELECT 
       a.id, a.asset_name, a.description,
       COALESCE(a.category, 'other') AS category,
       a.serial_number, a.model, a.manufacturer,
       a.purchase_date, a.purchase_cost, a.warranty_expiry,
       COALESCE(a.current_location,
         (SELECT t.to_location FROM asset_transfers t WHERE t.asset_id = a.id AND t.status IN ('approved','completed')
          ORDER BY COALESCE(t.updated_at, t.created_at) DESC LIMIT 1)
       ) AS current_location,
       COALESCE(a.assigned_department,
         (SELECT t.to_department FROM asset_transfers t WHERE t.asset_id = a.id AND t.status IN ('approved','completed')
          ORDER BY COALESCE(t.updated_at, t.created_at) DESC LIMIT 1)
       ) AS assigned_department,
       a.assigned_user_id, a.status, a.created_at, a.updated_at,
       (
         SELECT MIN(ms.scheduled_date)
         FROM maintenance_schedules ms
         WHERE ms.asset_id = a.id AND ms.status = 'scheduled'
       ) AS next_maintenance_date,
       (
         SELECT MAX(t.completed_at)
         FROM asset_transfers t
         WHERE t.asset_id = a.id AND t.status = 'completed'
       ) AS last_transfer_at
     FROM assets a
     ORDER BY a.id DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const { rows: countRows } = await pool.query(`SELECT COUNT(*) FROM assets`);
  const total = parseInt(countRows[0].count, 10);

  return { assets: assetsRows, total };
}

export async function addAsset(assetData: any) {
  // Insert columns including current_location and assigned_department when available
  const { rows } = await pool.query(
    `INSERT INTO assets (
      asset_name, description, category, serial_number, model, manufacturer,
      purchase_date, purchase_cost, warranty_expiry, status, assigned_user_id,
      current_location, assigned_department
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
    ) RETURNING *`,
    [
      assetData.asset_name,
      assetData.description ?? null,
      assetData.category ?? null,
      assetData.serial_number ?? null,
      assetData.model ?? null,
      assetData.manufacturer ?? null,
      assetData.purchase_date ?? null,
      assetData.purchase_cost ?? null,
      assetData.warranty_expiry ?? null,
      assetData.status ?? "active",
      assetData.assigned_user_id ?? null,
      assetData.current_location ?? null,
      assetData.assigned_department ?? null,
    ]
  );
  return rows[0];
}

export async function updateAsset(id: number, assetData: any) {
  // Whitelist updatable columns to avoid referencing non-existent columns
  const allowed = [
    "asset_name",
    "description",
    "category",
    "serial_number",
    "model",
    "manufacturer",
    "purchase_date",
    "purchase_cost",
    "warranty_expiry",
    "status",
    "assigned_user_id",
    "current_location",
    "assigned_department",
  ];
  const filtered: Record<string, any> = {};
  for (const key of allowed) if (key in assetData) filtered[key] = assetData[key];

  const fields = Object.keys(filtered);
  if (fields.length === 0) return null;

  const setQuery = fields.map((f, idx) => `${f} = $${idx + 1}`).join(", ");
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE assets SET ${setQuery} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0];
}

export async function deleteAsset(id: number) {
  const { rowCount } = await pool.query(`DELETE FROM assets WHERE id = $1`, [id]);
  return rowCount > 0;
}

// Search assets by id code, name, or serial number (simple)
export async function searchAssets(q: string, limit = 20) {
  const query = `%${q.toLowerCase()}%`;
  const { rows } = await pool.query(
    `SELECT 
        a.id, a.asset_name, a.serial_number, a.model, a.status, a.assigned_user_id,
        COALESCE(a.assigned_department,
          (SELECT t.to_department FROM asset_transfers t WHERE t.asset_id = a.id AND t.status IN ('approved','completed')
           ORDER BY COALESCE(t.updated_at, t.created_at) DESC LIMIT 1)
        ) AS assigned_department,
        COALESCE(a.current_location,
          (SELECT t.to_location FROM asset_transfers t WHERE t.asset_id = a.id AND t.status IN ('approved','completed')
           ORDER BY COALESCE(t.updated_at, t.created_at) DESC LIMIT 1)
        ) AS current_location
     FROM assets a
     WHERE LOWER(a.asset_name) LIKE $1
        OR LOWER(COALESCE(a.serial_number, '')) LIKE $1
        OR CAST(a.id AS TEXT) LIKE $2
     ORDER BY a.id DESC
     LIMIT $3`,
    [query, `%${q}%`, limit]
  );
  return rows;
}
