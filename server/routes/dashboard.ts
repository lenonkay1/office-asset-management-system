import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    // 1) Total assets
    const totalRes = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM assets"
    );
    const totalAssets = parseInt(totalRes.rows[0]?.count || "0", 10);

    // 2) Count by status (active / maintenance / retired)
    let active = 0, maintenance = 0, retired = 0;
    try {
      const statusRes = await pool.query<{ status: string; count: string }>(
        "SELECT status, COUNT(*)::text AS count FROM assets GROUP BY status"
      );
      for (const row of statusRes.rows) {
        const c = parseInt(row.count || "0", 10);
        if (row.status === "active") active = c;
        if (row.status === "maintenance") maintenance = c;
        if (row.status === "retired") retired = c;
      }
    } catch (e) {
      // If anything fails, leave defaults as 0
      console.warn("Status counts query failed:", e);
    }

    // 3) Pending transfers (optional table)
    let pendingTransfers = 0;
    try {
      const pendRes = await pool.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM asset_transfers WHERE status = 'pending'"
      );
      pendingTransfers = parseInt(pendRes.rows[0]?.count || "0", 10);
    } catch (e) {
      console.warn("Pending transfers query failed (table may not exist):", e);
    }

    // 4) Overdue maintenances (optional table)
    let overdueMaintenances = 0;
    try {
      const overRes = await pool.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM maintenance_schedules WHERE status = 'scheduled' AND scheduled_date < NOW()"
      );
      overdueMaintenances = parseInt(overRes.rows[0]?.count || "0", 10);
    } catch (e) {
      console.warn("Overdue maintenances query failed (table may not exist):", e);
    }

    return res.json({
      total_assets: totalAssets,
      active_assets: active,
      maintenance_assets: maintenance,
      retired_assets: retired,
      pending_transfers: pendingTransfers,
      overdue_maintenances: overdueMaintenances,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Asset categories: [{ category, count }]
router.get("/categories", async (_req, res) => {
  try {
    const result = await pool.query<{ category: string | null; count: string }>(
      "SELECT category, COUNT(*)::text AS count FROM assets GROUP BY category ORDER BY COUNT(*) DESC"
    );
    const categories = result.rows.map(r => ({
      category: r.category || "other",
      count: parseInt(r.count || "0", 10),
    }));
    return res.json(categories);
  } catch (err) {
    console.error("/api/dashboard/categories error:", err);
    return res.status(500).json({ error: "Failed to load categories" });
  }
});

// Recent activity (approximation using assets timestamps)
router.get("/recent-activity", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, asset_name, serial_number, created_at, updated_at
       FROM assets
       ORDER BY GREATEST(created_at, updated_at) DESC
       LIMIT 15`
    );
    const items = result.rows.map((row: any) => {
      const created = new Date(row.created_at);
      const updated = new Date(row.updated_at);
      const isCreated = Math.abs(updated.getTime() - created.getTime()) < 1000; // ~same
      return {
        id: row.id,
        action: isCreated ? "ASSET_CREATED" : "ASSET_UPDATED",
        timestamp: (isCreated ? created : updated).toISOString(),
        asset_name: row.asset_name,
        asset_id: `A${String(row.id).padStart(4, "0")}`,
        user_name: "system",
        serial_number: row.serial_number || null,
        current_location: null,
      };
    });
    return res.json(items);
  } catch (err) {
    console.error("/api/dashboard/recent-activity error:", err);
    return res.status(500).json({ error: "Failed to load activity" });
  }
});

// Overdue maintenances
router.get("/overdue-maintenances", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT ms.id, ms.title, ms.scheduled_date, a.id AS asset_id
       FROM maintenance_schedules ms
       JOIN assets a ON a.id = ms.asset_id
       WHERE ms.status = 'scheduled' AND ms.scheduled_date < NOW()
       ORDER BY ms.scheduled_date ASC
       LIMIT 50`
    );
    const items = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      asset_id: `A${String(row.asset_id).padStart(4, "0")}`,
      scheduled_date: new Date(row.scheduled_date).toISOString(),
    }));
    return res.json(items);
  } catch (err) {
    console.error("/api/dashboard/overdue-maintenances error:", err);
    return res.status(500).json({ error: "Failed to load overdue maintenances" });
  }
});

export default router;
