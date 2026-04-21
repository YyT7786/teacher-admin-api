import { Pool, ResultSetHeader } from 'mysql2/promise';
import { httpError } from '../utils/helpers';
import { HttpStatus } from '../utils/constants';

async function suspendService(pool: Pool, studentEmail: string): Promise<void> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE students SET is_suspended = TRUE WHERE email = ?',
    [studentEmail]
  );
  if (result.affectedRows === 0) {
    throw httpError(HttpStatus.NOT_FOUND, `Student not found: ${studentEmail}`);
  }
}

export default suspendService;
