import registerService from '../../src/services/registerService';

function makeMockConn(overrides?: Partial<Record<string, jest.Mock>>) {
  return {
    execute: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
    ...overrides,
  };
}

describe('registerService', () => {
  it('rolls back and rethrows when a student insert fails', async () => {
    const mockConn = makeMockConn();
    mockConn.execute
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockRejectedValueOnce(new Error('DB error'));
    const mockPool = { getConnection: jest.fn().mockResolvedValue(mockConn) };

    await expect(
      registerService(mockPool as any, 'teacher@gmail.com', ['s@gmail.com'])
    ).rejects.toThrow('DB error');

    expect(mockConn.rollback).toHaveBeenCalled();
    expect(mockConn.commit).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalled();
  });

  it('commits and releases on success', async () => {
    const mockConn = makeMockConn();
    mockConn.execute
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([{}]);
    const mockPool = { getConnection: jest.fn().mockResolvedValue(mockConn) };

    await registerService(mockPool as any, 'teacher@gmail.com', ['s@gmail.com']);

    expect(mockConn.commit).toHaveBeenCalled();
    expect(mockConn.rollback).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalled();
  });

  let mockConn: ReturnType<typeof makeMockConn>;
  let mockPool: { getConnection: jest.Mock };

  beforeEach(() => {
    mockConn = makeMockConn();
    mockPool = { getConnection: jest.fn().mockResolvedValue(mockConn) };
  });

  it('upserts teacher and two students, links them in teacher_students', async () => {
    mockConn.execute
      .mockResolvedValueOnce([{ insertId: 1 }])   // upsert teacher → id 1
      .mockResolvedValueOnce([{ insertId: 10 }])  // upsert student 1 → id 10
      .mockResolvedValueOnce([{}])                 // INSERT IGNORE student 1
      .mockResolvedValueOnce([{ insertId: 11 }])  // upsert student 2 → id 11
      .mockResolvedValueOnce([{}]);                // INSERT IGNORE student 2

    await registerService(mockPool as any, 'teacherken@gmail.com', ['s1@gmail.com', 's2@gmail.com']);

    expect(mockConn.execute).toHaveBeenCalledTimes(5);
    expect(mockConn.execute).toHaveBeenNthCalledWith(1,
      'INSERT INTO teachers (email) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      ['teacherken@gmail.com']
    );
    expect(mockConn.execute).toHaveBeenNthCalledWith(3,
      'INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
      [1, 10]
    );
    expect(mockConn.execute).toHaveBeenNthCalledWith(5,
      'INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
      [1, 11]
    );
  });

  it('uses insertId from teacher upsert to link students', async () => {
    mockConn.execute
      .mockResolvedValueOnce([{ insertId: 42 }])  // upsert teacher → id 42
      .mockResolvedValueOnce([{ insertId: 99 }])  // upsert student → id 99
      .mockResolvedValueOnce([{}]);                // INSERT IGNORE

    await registerService(mockPool as any, 'new@gmail.com', ['s@gmail.com']);

    expect(mockConn.execute).toHaveBeenCalledTimes(3);
    expect(mockConn.execute).toHaveBeenNthCalledWith(3,
      'INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
      [42, 99]
    );
  });

  it('uses insertId from student upsert to link to teacher', async () => {
    mockConn.execute
      .mockResolvedValueOnce([{ insertId: 7 }])   // upsert teacher → id 7
      .mockResolvedValueOnce([{ insertId: 55 }])  // upsert student → id 55
      .mockResolvedValueOnce([{}]);                // INSERT IGNORE

    await registerService(mockPool as any, 'teacher@gmail.com', ['newstudent@gmail.com']);

    expect(mockConn.execute).toHaveBeenNthCalledWith(3,
      'INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES (?, ?)',
      [7, 55]
    );
  });
});
