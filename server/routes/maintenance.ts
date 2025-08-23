import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { pool } from "../db";
import { isEnabled, sendEmail, getApproverEmails, getUserEmail } from "../services/notifications";

const router = Router();

// Helpers
function mapAssetRow(row: any) {
  return {
    id: row.a_id,
    asset_id: row.asset_code || `A${String(row.a_id).padStart(4, "0")}`,
    asset_name: row.asset_name,
    description: row.a_description,
    category: row.category,
    serial_number: row.serial_number,
    model: row.model,
    manufacturer: row.manufacturer,
    purchase_date: row.purchase_date,
    purchase_cost: row.purchase_cost ? Number(row.purchase_cost) : null,
    warranty_expiry: row.warranty_expiry,
    current_location: row.current_location ?? "Unknown",
    assigned_department: row.assigned_department ?? "-",
    assigned_user_id: row.assigned_user_id ?? null,
    status: row.a_status,
    condition: row.condition ?? null,
    notes: row.a_notes ?? null,
    created_at: row.a_created_at,
    updated_at: row.a_updated_at,
  };
}

function mapMaintenanceRow(row: any) {
  return {
    id: row.ms_id,
    asset: mapAssetRow(row),
    title: row.title,
    description: row.ms_description,
    scheduledDate: row.scheduled_date,
    completedDate: row.completed_date,
    status: row.ms_status,
    performedBy: row.performed_by,
    cost: row.cost != null ? Number(row.cost) : null,
    notes: row.ms_notes,
    createdById: row.created_by_id,
    created_at: row.ms_created_at,
    updated_at: row.ms_updated_at,
  };
}

// GET /api/maintenance?limit=&page=
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const offset = (page - 1) * limit;

    const countRes = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM maintenance_schedules"
    );
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const listRes = await pool.query(
      `SELECT 
         ms.id            AS ms_id,
         ms.asset_id      AS ms_asset_id,
         ms.title         AS title,
         ms.description   AS ms_description,
         ms.scheduled_date AS scheduled_date,
         ms.completed_date AS completed_date,
         ms.status        AS ms_status,
         ms.performed_by  AS performed_by,
         ms.cost          AS cost,
         ms.notes         AS ms_notes,
         ms.created_by_id AS created_by_id,
         ms.created_at    AS ms_created_at,
         ms.updated_at    AS ms_updated_at,
         a.id             AS a_id,
         a.asset_name     AS asset_name,
         a.description    AS a_description,
         a.category       AS category,
         a.serial_number  AS serial_number,
         a.model          AS model,
         a.manufacturer   AS manufacturer,
         a.purchase_date  AS purchase_date,
         a.purchase_cost  AS purchase_cost,
         a.warranty_expiry AS warranty_expiry,
         a.assigned_user_id AS assigned_user_id,
         a.status         AS a_status,
         a.created_at     AS a_created_at,
         a.updated_at     AS a_updated_at,
         NULL::text       AS asset_code,
         NULL::text       AS current_location,
         NULL::text       AS assigned_department,
         NULL::text       AS condition,
         NULL::text       AS a_notes
       FROM maintenance_schedules ms
       JOIN assets a ON a.id = ms.asset_id
       ORDER BY ms.scheduled_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const maintenances = listRes.rows.map(mapMaintenanceRow);

    return res.json({
      maintenances,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/maintenance error:", err);
    return res.status(500).json({ message: "Failed to fetch maintenance" });
  }
});

// POST /api/maintenance
router.post("/", verifyToken, async (req, res) => {
  try {
    const { asset_id, asset_code, title, description, scheduledDate } = req.body || {};

    if ((!asset_id && !asset_code) || !title || !scheduledDate) {
      return res.status(400).json({ message: "Provide asset_id (number) or asset_code (e.g., A0007), plus title and scheduledDate" });
    }

    // Only admin or asset_manager can schedule
    if (!req.user || !["admin", "asset_manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Resolve asset numeric id from either numeric asset_id or string asset_code like A0007
    let resolvedAssetId: number | null = null;
    const raw = asset_id ?? asset_code;

    if (typeof raw === "number") {
      resolvedAssetId = raw;
    } else if (typeof raw === "string") {
      const trimmed = raw.trim();
      // Accept plain digits
      if (/^\d+$/.test(trimmed)) {
        resolvedAssetId = parseInt(trimmed, 10);
      } else {
        // Accept codes like A0007 -> 7
        const match = trimmed.match(/^A(\d+)$/i);
        if (match) {
          resolvedAssetId = parseInt(match[1], 10);
        }
      }
    }

    if (!resolvedAssetId || Number.isNaN(resolvedAssetId)) {
      return res.status(400).json({ message: "Invalid asset reference. Use numeric asset_id or code like A0007." });
    }

    const insertRes = await pool.query(
      `INSERT INTO maintenance_schedules (
         asset_id, title, description, scheduled_date, status, created_by_id
       ) VALUES ($1, $2, $3, $4, 'scheduled', $5)
       RETURNING id`,
      [resolvedAssetId, title, description || null, new Date(scheduledDate), req.user.user_id]
    );

    // Mark asset status as 'maintenance' so the Assets page and Dashboard reflect it
    await pool.query(
      `UPDATE assets SET status = 'maintenance', updated_at = NOW() WHERE id = $1 AND status <> 'maintenance'`,
      [resolvedAssetId]
    );

    const newId = insertRes.rows[0].id;

    // Return the created record by selecting it back with the join
    const itemRes = await pool.query(
      `SELECT 
         ms.id            AS ms_id,
         ms.asset_id      AS ms_asset_id,
         ms.title         AS title,
         ms.description   AS ms_description,
         ms.scheduled_date AS scheduled_date,
         ms.completed_date AS completed_date,
         ms.status        AS ms_status,
         ms.performed_by  AS performed_by,
         ms.cost          AS cost,
         ms.notes         AS ms_notes,
         ms.created_by_id AS created_by_id,
         ms.created_at    AS ms_created_at,
         ms.updated_at    AS ms_updated_at,
         a.id             AS a_id,
         a.asset_name     AS asset_name,
         a.description    AS a_description,
         a.category       AS category,
         a.serial_number  AS serial_number,
         a.model          AS model,
         a.manufacturer   AS manufacturer,
         a.purchase_date  AS purchase_date,
         a.purchase_cost  AS purchase_cost,
         a.warranty_expiry AS warranty_expiry,
         a.assigned_user_id AS assigned_user_id,
         a.status         AS a_status,
         a.created_at     AS a_created_at,
         a.updated_at     AS a_updated_at,
         NULL::text       AS asset_code,
         NULL::text       AS current_location,
         NULL::text       AS assigned_department,
         NULL::text       AS condition,
         NULL::text       AS a_notes
       FROM maintenance_schedules ms
       JOIN assets a ON a.id = ms.asset_id
       WHERE ms.id = $1`,
      [newId]
    );

    const created = mapMaintenanceRow(itemRes.rows[0]);

    // Notify asset managers/admins of new maintenance schedule
    try {
      if (await isEnabled("maintenance_reminders", "true") && await isEnabled("notifications_email", "true")) {
        const emails = await getApproverEmails();
        if (emails.length) {
          await sendEmail(
            emails,
            `Maintenance scheduled for asset #${created.asset.id}`,
            `<p>A maintenance has been scheduled.</p>
             <ul>
               <li>Asset: ${created.asset.asset_name} (#${created.asset.id})</li>
               <li>Title: ${created.title}</li>
               <li>Scheduled Date: ${new Date(created.scheduledDate).toLocaleString()}</li>
             </ul>`,
            undefined,
            { eventType: 'maintenance_scheduled', meta: { maintenance_id: created.id, asset_id: created.asset.id } }
          );
        }
      }
    } catch (e) {
      console.warn("Notification error (maintenance schedule):", e);
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/maintenance error:", err);
    return res.status(500).json({ message: "Failed to schedule maintenance" });
  }
});

// PUT /api/maintenance/:id/complete
router.put("/:id/complete", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { notes, cost, performedBy } = req.body || {};

    if (!id) return res.status(400).json({ message: "Invalid id" });

    if (!req.user || !["admin", "asset_manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await pool.query(
      `UPDATE maintenance_schedules
       SET status = 'completed',
           completed_date = NOW(),
           notes = COALESCE($2, notes),
           cost = $3,
           performed_by = COALESCE($4, performed_by),
           updated_at = NOW()
       WHERE id = $1`,
      [id, notes || null, cost != null ? Number(cost) : null, performedBy || null]
    );

    // Notify admins of maintenance completion
    try {
      if (await isEnabled("notifications_email", "true")) {
        const emails = await getApproverEmails();
        if (emails.length) {
          await sendEmail(
            emails,
            `Maintenance #${id} marked completed`,
            `<p>Maintenance has been marked completed.</p>`,
            undefined,
            { eventType: 'maintenance_completed', meta: { maintenance_id: id } }
          );
        }
      }
    } catch (e) {
      console.warn("Notification error (maintenance complete):", e);
    }

    return res.json({ message: "Maintenance marked as completed" });
  } catch (err) {
    console.error("PUT /api/maintenance/:id/complete error:", err);
    return res.status(500).json({ message: "Failed to complete maintenance" });
  }
});

export default router;

