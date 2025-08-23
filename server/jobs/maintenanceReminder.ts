import { pool } from "../db";
import { isEnabled, sendEmail, getApproverEmails } from "../services/notifications";

export async function runMaintenanceReminderJob() {
  try {
    if (!(await isEnabled("maintenance_reminders", "true")) || !(await isEnabled("notifications_email", "true"))) {
      return;
    }

    // Find maintenances scheduled within the next 48 hours that are still 'scheduled'
    const rows = await pool.query<{
      id: number;
      title: string;
      scheduled_date: string;
      asset_id: number;
      asset_name: string;
    }>(
      `SELECT ms.id, ms.title, ms.scheduled_date, a.id as asset_id, a.asset_name
       FROM maintenance_schedules ms
       JOIN assets a ON a.id = ms.asset_id
       WHERE ms.status = 'scheduled' AND ms.scheduled_date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
       ORDER BY ms.scheduled_date ASC`
    );

    if (!rows.rowCount) return;
    const emails = await getApproverEmails();
    if (!emails.length) return;

    const items = rows.rows
      .map(r => `- ${r.asset_name} (#${r.asset_id}): ${new Date(r.scheduled_date).toLocaleString()} — ${r.title}`)
      .join("<br/>");

    await sendEmail(
      emails,
      `Upcoming maintenance tasks (${rows.rowCount})`,
      `<p>The following maintenance tasks are due within 48 hours:</p><p>${items}</p>`
    );
  } catch (e) {
    console.warn("Maintenance reminder job error:", e);
  }
}
