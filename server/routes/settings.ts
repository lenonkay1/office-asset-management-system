import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { pool } from "../db";

const router = Router();

// Helper: normalize incoming settings object into [key,value] array of strings
function entriesFromBody(body: any): [string, string][] {
  if (!body || typeof body !== 'object') return [];
  return Object.entries(body).map(([k, v]) => [k, v == null ? "" : String(v)]);
}

// GET /api/settings
router.get("/", verifyToken, async (_req, res) => {
  try {
    const result = await pool.query<{ key: string; value: string }>(
      "SELECT key, value FROM settings"
    );
    const map: Record<string, string> = {};
    for (const row of result.rows) map[row.key] = row.value;
    return res.json(map);
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return res.status(500).json({ message: "Failed to load settings" });
  }
});

// PUT /api/settings
// Only admin can update settings
router.put("/", verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update settings' });
    }

    const entries = entriesFromBody(req.body);
    if (!entries.length) return res.status(400).json({ message: 'No settings provided' });

    // Upsert each key/value
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }

    return res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error("PUT /api/settings error:", err);
    return res.status(500).json({ message: "Failed to save settings" });
  }
});

export default router;

