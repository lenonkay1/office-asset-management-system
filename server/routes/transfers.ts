import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { pool } from "../db";
import { isEnabled, sendEmail, getApproverEmails, getUserEmail } from "../services/notifications";

const router = Router();

function mapTransferRow(row: any) {
  return {
    id: row.t_id,
    asset: {
      id: row.a_id,
      asset_id: `A${String(row.a_id).padStart(4, "0")}`,
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
    },
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    fromDepartment: row.from_department,
    toDepartment: row.to_department,
    fromLocation: row.from_location,
    toLocation: row.to_location,
    reason: row.reason,
    status: row.t_status,
    requestedById: row.requested_by_id,
    approvedById: row.approved_by_id,
    completedAt: row.completed_at,
    created_at: row.t_created_at,
    updated_at: row.t_updated_at,
  };
}

// GET /api/transfers?limit=&page=
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const offset = (page - 1) * limit;

    const countRes = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM asset_transfers"
    );
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const listRes = await pool.query(
      `SELECT 
         t.id              AS t_id,
         t.asset_id        AS t_asset_id,
         t.from_user_id    AS from_user_id,
         t.to_user_id      AS to_user_id,
         t.from_department AS from_department,
         t.to_department   AS to_department,
         t.from_location   AS from_location,
         t.to_location     AS to_location,
         t.reason          AS reason,
         t.status          AS t_status,
         t.requested_by_id AS requested_by_id,
         t.approved_by_id  AS approved_by_id,
         t.completed_at    AS completed_at,
         t.created_at      AS t_created_at,
         t.updated_at      AS t_updated_at,
         a.id              AS a_id,
         a.asset_name      AS asset_name,
         a.description     AS a_description,
         a.category        AS category,
         a.serial_number   AS serial_number,
         a.model           AS model,
         a.manufacturer    AS manufacturer,
         a.purchase_date   AS purchase_date,
         a.purchase_cost   AS purchase_cost,
         a.warranty_expiry AS warranty_expiry,
         a.assigned_user_id AS assigned_user_id,
         a.status          AS a_status,
         a.created_at      AS a_created_at,
         a.updated_at      AS a_updated_at,
         NULL::text        AS current_location,
         NULL::text        AS assigned_department,
         NULL::text        AS condition,
         NULL::text        AS a_notes
       FROM asset_transfers t
       JOIN assets a ON a.id = t.asset_id
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const transfers = listRes.rows.map(mapTransferRow);

    return res.json({
      transfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/transfers error:", err);
    return res.status(500).json({ message: "Failed to fetch transfers" });
  }
});

// POST /api/transfers
router.post("/", verifyToken, async (req, res) => {
  try {
    const { asset_id, toDepartment, toLocation, reason, fromDepartment, fromLocation } = req.body || {};

    if (!asset_id || !toDepartment || !toLocation || !reason) {
      return res.status(400).json({ message: "asset_id, toDepartment, toLocation and reason are required" });
    }

    // Requester is the logged-in user
    const requestedById = req.user!.user_id;

    const insertRes = await pool.query(
      `INSERT INTO asset_transfers (
         asset_id, from_department, to_department, from_location, to_location, reason,
         status, requested_by_id
       ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
       RETURNING id`,
      [asset_id, fromDepartment || null, toDepartment, fromLocation || null, toLocation, reason, requestedById]
    );

    // Notify approvers if enabled
    try {
      if (await isEnabled("transfer_approvals", "true") && await isEnabled("notifications_email", "true")) {
        const emails = await getApproverEmails();
        if (emails.length) {
          await sendEmail(
            emails,
            `Asset transfer request for asset #${asset_id}`,
            `<p>A new transfer request has been submitted.</p>
             <ul>
               <li>Asset ID: ${asset_id}</li>
               <li>From: ${fromDepartment || "-"} / ${fromLocation || "-"}</li>
               <li>To: ${toDepartment} / ${toLocation}</li>
               <li>Reason: ${reason}</li>
             </ul>
             <p>Please log in to review and approve.</p>`,
            undefined,
            { eventType: 'transfer_request', meta: { asset_id, toDepartment, toLocation, requestedById } }
          );
        }
      }
    } catch (e) {
      console.warn("Notification error (transfer request):", e);
    }

    return res.status(201).json({ id: insertRes.rows[0].id });
  } catch (err) {
    console.error("POST /api/transfers error:", err);
    return res.status(500).json({ message: "Failed to create transfer" });
  }
});

// PUT /api/transfers/:id/approve
router.put("/:id/approve", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    // Only admin/asset_manager/department_head can approve
    if (!req.user || !["admin", "asset_manager", "department_head"].includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const result = await pool.query(
      `UPDATE asset_transfers
       SET status = 'approved', approved_by_id = $2, updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING id`,
      [id, req.user.user_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Transfer not in pending status or not found" });
    }

    // Notify requester
    try {
      if (await isEnabled("notifications_email", "true") && await isEnabled("transfer_approvals", "true")) {
        const requesterRes = await pool.query<{ requested_by_id: number; asset_id: number; to_department: string; to_location: string }>(
          `SELECT requested_by_id, asset_id, to_department, to_location FROM asset_transfers WHERE id = $1`,
          [id]
        );
        const row = requesterRes.rows[0];
        if (row) {
          const requesterEmail = await getUserEmail(row.requested_by_id);
          if (requesterEmail) {
            await sendEmail(
              requesterEmail,
              `Your asset transfer request #${id} was approved`,
              `<p>Your transfer request has been approved.</p>
               <ul>
                 <li>Asset ID: ${row.asset_id}</li>
                 <li>Destination: ${row.to_department} / ${row.to_location}</li>
               </ul>`,
              undefined,
              { eventType: 'transfer_approved', meta: { transfer_id: id, asset_id: row.asset_id } }
            );
          }
        }
      }
    } catch (e) {
      console.warn("Notification error (transfer approve):", e);
    }

    return res.json({ message: "Transfer approved" });
  } catch (err) {
    console.error("PUT /api/transfers/:id/approve error:", err);
    return res.status(500).json({ message: "Failed to approve transfer" });
  }
});

// PUT /api/transfers/:id/complete
router.put("/:id/complete", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    // Only admin/asset_manager/department_head can complete
    if (!req.user || !["admin", "asset_manager", "department_head"].includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Mark transfer completed and get destination info
    const upd = await pool.query<{ asset_id: number; to_department: string | null; to_location: string | null }>(
      `UPDATE asset_transfers
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'approved'
       RETURNING asset_id, to_department, to_location`,
      [id]
    );

    if (upd.rowCount === 0) {
      return res.status(400).json({ message: "Transfer not in approved status or not found" });
    }

    const { asset_id, to_department, to_location } = upd.rows[0];

    // Update the asset's department and location (only if provided)
    await pool.query(
      `UPDATE assets
       SET assigned_department = COALESCE($2, assigned_department),
           current_location    = COALESCE($3, current_location),
           updated_at          = NOW()
       WHERE id = $1`,
      [asset_id, to_department, to_location]
    );

    // Notify asset manager/admins about completion
    try {
      if (await isEnabled("notifications_email", "true")) {
        const emails = await getApproverEmails();
        if (emails.length) {
          await sendEmail(
            emails,
            `Transfer #${id} completed for asset #${asset_id}`,
            `<p>The transfer has been completed.</p>
             <ul>
               <li>Asset ID: ${asset_id}</li>
               <li>New Department: ${to_department || "(unchanged)"}</li>
               <li>New Location: ${to_location || "(unchanged)"}</li>
             </ul>`,
            undefined,
            { eventType: 'transfer_completed', meta: { transfer_id: id, asset_id, to_department, to_location } }
          );
        }
      }
    } catch (e) {
      console.warn("Notification error (transfer complete):", e);
    }

    return res.json({ message: "Transfer completed and asset updated" });
  } catch (err) {
    console.error("PUT /api/transfers/:id/complete error:", err);
    return res.status(500).json({ message: "Failed to complete transfer" });
  }
});

// GET /api/transfers/asset/:assetId
router.get("/asset/:assetId", verifyToken, async (req, res) => {
  try {
    const assetId = parseInt(req.params.assetId, 10);
    if (!assetId) return res.status(400).json({ message: "Invalid asset id" });

    const limit = parseInt((req.query.limit as string) || "50", 10);

    const rows = await pool.query(
      `SELECT id, from_department, to_department, from_location, to_location, reason, status,
              requested_by_id, approved_by_id, completed_at, created_at, updated_at
       FROM asset_transfers
       WHERE asset_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [assetId, limit]
    );

    return res.json(rows.rows);
  } catch (err) {
    console.error("GET /api/transfers/asset/:assetId error:", err);
    return res.status(500).json({ message: "Failed to fetch transfer history" });
  }
});

export default router;

