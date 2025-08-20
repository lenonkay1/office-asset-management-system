import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

import dotenv from 'dotenv';
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });



export async function getDashboardStats() {
  try {
    const stats = await db.query.stats(); // Replace with your actual query
    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}