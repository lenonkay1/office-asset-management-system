import nodemailer from "nodemailer";
import { pool } from "../db";

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function getMailConfigFromEnv(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "no-reply@example.com";

  if (!host || !port || !user || !pass) return null;
  return {
    host,
    port: port!,
    secure: !!process.env.SMTP_SECURE && process.env.SMTP_SECURE !== "false",
    user,
    pass,
    from,
  };
}

let cachedTransporter: nodemailer.Transporter | null = null;
let logsTableEnsured = false;

export async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (cachedTransporter) return cachedTransporter;
  const cfg = getMailConfigFromEnv();
  if (!cfg) return null;

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  return cachedTransporter;
}

async function ensureLogsTable() {
  if (logsTableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      event_type TEXT,
      recipients TEXT NOT NULL,
      subject TEXT NOT NULL,
      html TEXT,
      text_body TEXT,
      status TEXT NOT NULL,
      error TEXT,
      meta_json JSONB
    )
  `);
  logsTableEnsured = true;
}

export async function ensureNotificationLogsTable() {
  await ensureLogsTable();
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  const res = await pool.query<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map: Record<string, string> = {};
  for (const r of res.rows) map[r.key] = r.value;
  return map;
}

export async function isEnabled(key: string, fallback = "true"): Promise<boolean> {
  const settings = await getSettingsMap();
  const v = settings[key] ?? fallback;
  return String(v).toLowerCase() === "true";
}

type SendContext = { eventType?: string; meta?: any };

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string,
  context?: SendContext
) {
  await ensureLogsTable();
  const recipients = Array.isArray(to) ? to.join(",") : to;
  const metaJson = context?.meta ? JSON.stringify(context.meta) : null;

  const transporter = await getTransporter();
  if (!transporter) {
    console.warn("Email transporter not configured; skipping email to", to);
    await pool.query(
      `INSERT INTO notification_logs (event_type, recipients, subject, html, text_body, status, error, meta_json)
       VALUES ($1,$2,$3,$4,$5,'skipped_no_transporter',NULL,$6)`,
      [context?.eventType || null, recipients, subject, html || null, text || null, metaJson]
    );
    return { queued: false, status: 'skipped' as const };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
  try {
    await transporter.sendMail({ from, to, subject, html, text });
    await pool.query(
      `INSERT INTO notification_logs (event_type, recipients, subject, html, text_body, status, error, meta_json)
       VALUES ($1,$2,$3,$4,$5,'sent',NULL,$6)`,
      [context?.eventType || null, recipients, subject, html || null, text || null, metaJson]
    );
    return { queued: true, status: 'sent' as const };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    await pool.query(
      `INSERT INTO notification_logs (event_type, recipients, subject, html, text_body, status, error, meta_json)
       VALUES ($1,$2,$3,$4,$5,'error',$6,$7)`,
      [context?.eventType || null, recipients, subject, html || null, text || null, errorMsg, metaJson]
    );
    console.warn("Email send error:", errorMsg);
    return { queued: false, status: 'error' as const };
  }
}

export async function getAdminEmails(): Promise<string[]> {
  const res = await pool.query<{ email: string }>("SELECT email FROM users WHERE role = 'admin' AND is_active = true");
  return res.rows.map(r => r.email).filter(Boolean);
}

export async function getApproverEmails(): Promise<string[]> {
  const res = await pool.query<{ email: string }>(
    "SELECT email FROM users WHERE role IN ('admin','asset_manager','department_head') AND is_active = true"
  );
  return res.rows.map(r => r.email).filter(Boolean);
}

export async function getUserEmail(id: number): Promise<string | null> {
  const res = await pool.query<{ email: string }>("SELECT email FROM users WHERE id = $1", [id]);
  return res.rows[0]?.email ?? null;
}
