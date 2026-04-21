import { Pool, ResultSetHeader } from 'mysql2/promise';

async function suspendService(pool: Pool, studentEmail: string): Promise<void> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE students SET is_suspended = TRUE WHERE email = ?',
    [studentEmail]
  );
  if (result.affectedRows === 0) {
    throw Object.assign(new Error(`Student not found: ${studentEmail}`), { statusCode: 404 });
  }
}

export default suspendService;
