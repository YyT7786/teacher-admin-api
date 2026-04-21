import { Pool, RowDataPacket } from 'mysql2/promise';

interface StudentRow extends RowDataPacket {
  email: string;
}

async function commonStudentsService(pool: Pool, teacherEmails: string[]): Promise<string[]> {
  if (teacherEmails.length === 0) return [];
  const placeholders = teacherEmails.map(() => '?').join(', ');
  const sql = `
    SELECT s.email
    FROM students s
    JOIN teacher_students ts ON s.id = ts.student_id
    JOIN teachers t ON ts.teacher_id = t.id
    WHERE t.email IN (${placeholders})
    GROUP BY s.id
    HAVING COUNT(DISTINCT t.id) = ?
  `;
  const [rows] = await pool.execute<StudentRow[]>(sql, [...teacherEmails, teacherEmails.length]);
  return rows.map(row => row.email);
}

export default commonStudentsService;
