import { Pool, ResultSetHeader } from 'mysql2/promise';

async function registerService(pool: Pool, teacherEmail: string, studentEmails: string[]): Promise<void> {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [teacherResult] = await conn.execute<ResultSetHeader>(
      'INSERT INTO teachers (email) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [teacherEmail]
    );
    const teacherId = teacherResult.insertId;

    for (const email of studentEmails) {
      const [studentResult] = await conn.execute<ResultSetHeader>(
        'INSERT INTO students (email) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
        [email]
      );
      const studentId = studentResult.insertId;
      await conn.execute(
        'INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
        [teacherId, studentId]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default registerService;
