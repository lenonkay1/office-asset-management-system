// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { users, assets } from "./shared/schema"; // Correct path to your schema
import dotenv from "dotenv";


dotenv.config();

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Initialize Postgres pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema: { users, assets } });

// === Dashboard stats function ===
export async function getDashboardStats() {
  try {
    // Count total users
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .execute();

    // Count total assets
    const [{ count: totalAssets }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .execute();

    return { totalUsers, totalAssets };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}
