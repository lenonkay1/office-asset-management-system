import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { sendEmail, getTransporter, ensureNotificationLogsTable } from "../services/notifications";
import { pool } from "../db";

const router = Router();

// POST /api/notifications/test { to?: string }
router.post("/test", verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can send test notifications' });
    }

    const transporter = await getTransporter();
    if (!transporter) {
      return res.status(400).json({ message: 'SMTP is not configured on the server' });
    }

    const to = (req.body?.to as string) || process.env.SMTP_TEST_TO || process.env.SMTP_USER;
    if (!to) return res.status(400).json({ message: 'Please provide a test recipient email' });

    await sendEmail(to, 'Test notification', '<p>This is a test notification from Office Asset Management System.</p>', 'This is a test notification');

    return res.json({ message: `Test email sent to ${to}` });
  } catch (e) {
    console.error('Test notification error:', e);
    return res.status(500).json({ message: 'Failed to send test email' });
  }
});

// GET /api/notifications/logs
// Admin only; supports filters and pagination
router.get("/logs", verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view notification logs' });
    }

    await ensureNotificationLogsTable();

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    const status = (req.query.status as string) || '';
    if (status) { where.push(`status = $${i++}`); params.push(status); }

    const eventType = (req.query.event_type as string) || '';
    if (eventType) { where.push(`event_type = $${i++}`); params.push(eventType); }

    const q = (req.query.q as string) || '';
    if (q) { where.push(`(recipients ILIKE $${i} OR subject ILIKE $${i} OR error ILIKE $${i})`); params.push(`%${q}%`); i++; }

    const from = (req.query.from as string) || '';
    if (from) { where.push(`created_at >= $${i++}`); params.push(new Date(from)); }

    const to = (req.query.to as string) || '';
    if (to) { where.push(`created_at <= $${i++}`); params.push(new Date(to)); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRes = await pool.query<{ count: string }>(`SELECT COUNT(*)::text as count FROM notification_logs ${whereSql}`, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const rowsRes = await pool.query(
      `SELECT id, created_at, event_type, recipients, subject, status, error, meta_json
       FROM notification_logs
       ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );

    return res.json({
      logs: rowsRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (e) {
    console.error('GET /api/notifications/logs error:', e);
    return res.status(500).json({ message: 'Failed to fetch notification logs' });
  }
});

export default router;
