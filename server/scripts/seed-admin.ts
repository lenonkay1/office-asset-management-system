import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Pool } from "pg";

dotenv.config();

async function main() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_DEPARTMENT } = process.env as Record<string, string>;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const username = ADMIN_USERNAME || "admin";
  const password = ADMIN_PASSWORD || "admin123"; // consider changing after first login
  const email = ADMIN_EMAIL || "admin@example.com";
  const department = ADMIN_DEPARTMENT || "IT";

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rowCount) {
      console.log(`User '${username}' already exists (id=${existing.rows[0].id}). Skipping.`);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const res = await pool.query(
      `INSERT INTO users (username, password, email, full_name, role, department, is_active)
       VALUES ($1,$2,$3,$4,'admin',$5,true)
       RETURNING id`,
      [username, hashed, email, "System Admin", department]
    );

    console.log(`Created admin user '${username}' with id=${res.rows[0].id}`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

