import { Pool, RowDataPacket } from 'mysql2/promise';

interface RecipientRow extends RowDataPacket {
  email: string;
}

function extractMentionedEmails(text: string): string[] {
  const matches = text.match(/@([\w.+-]+@[\w.-]+\.\w+)/g) || [];
  return matches.map(m => m.slice(1));
}

async function notificationService(pool: Pool, teacherEmail: string, notification: string): Promise<string[]> {
  const mentionedEmails = extractMentionedEmails(notification);

  let sql: string;
  let params: (string | number)[];

  if (mentionedEmails.length > 0) {
    const placeholders = mentionedEmails.map(() => '?').join(', ');
    sql = `
      SELECT DISTINCT s.email
      FROM students s
      WHERE s.is_suspended = FALSE
        AND (
          s.id IN (
            SELECT ts.student_id
            FROM teacher_students ts
            JOIN teachers t ON ts.teacher_id = t.id
            WHERE t.email = ?
          )
          OR s.email IN (${placeholders})
        )
    `;
    params = [teacherEmail, ...mentionedEmails];
  } else {
    sql = `
      SELECT DISTINCT s.email
      FROM students s
      JOIN teacher_students ts ON s.id = ts.student_id
      JOIN teachers t ON ts.teacher_id = t.id
      WHERE t.email = ?
        AND s.is_suspended = FALSE
    `;
    params = [teacherEmail];
  }

  const [rows] = await pool.execute<RecipientRow[]>(sql, params);
  return rows.map(row => row.email);
}

export default notificationService;
