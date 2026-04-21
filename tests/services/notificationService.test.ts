import notificationService from '../../src/services/notificationService';

describe('notificationService', () => {
  let mockPool: { execute: jest.Mock };

  beforeEach(() => {
    mockPool = { execute: jest.fn() };
  });

  it('returns registered non-suspended students', async () => {
    mockPool.execute.mockResolvedValueOnce([[{ email: 'studentbob@gmail.com' }]]);
    const result = await notificationService(mockPool as any, 'teacherken@gmail.com', 'Hey everybody');
    expect(result).toEqual(['studentbob@gmail.com']);
  });

  it('includes @mentioned students even if not registered', async () => {
    mockPool.execute.mockResolvedValueOnce([[
      { email: 'studentbob@gmail.com' },
      { email: 'studentagnes@gmail.com' },
    ]]);
    const result = await notificationService(
      mockPool as any,
      'teacherken@gmail.com',
      'Hello! @studentagnes@gmail.com @studentmiche@gmail.com'
    );
    expect(result).toContain('studentagnes@gmail.com');
    expect(result).toContain('studentbob@gmail.com');
  });

  it('excludes suspended students (SQL handles this via is_suspended = FALSE)', async () => {
    mockPool.execute.mockResolvedValueOnce([[{ email: 'active@gmail.com' }]]);
    const result = await notificationService(mockPool as any, 'teacher@gmail.com', 'Hello');
    expect(result).toEqual(['active@gmail.com']);
  });

  it('deduplicates via DISTINCT in SQL', async () => {
    mockPool.execute.mockResolvedValueOnce([[{ email: 'student@gmail.com' }]]);
    const result = await notificationService(
      mockPool as any,
      'teacher@gmail.com',
      'Hello @student@gmail.com'
    );
    expect(result.filter((e: string) => e === 'student@gmail.com')).toHaveLength(1);
  });

  it('returns empty array when no eligible recipients', async () => {
    mockPool.execute.mockResolvedValueOnce([[]]);
    const result = await notificationService(mockPool as any, 'teacher@gmail.com', 'Hello');
    expect(result).toEqual([]);
  });

  it('extracts @mentioned emails correctly from notification text', async () => {
    mockPool.execute.mockResolvedValueOnce([[]]);
    await notificationService(mockPool as any, 'teacher@gmail.com', 'Hi @alice@x.com and @bob@y.com!');
    expect(mockPool.execute).toHaveBeenCalledWith(
      expect.stringContaining('OR s.email IN'),
      expect.arrayContaining(['alice@x.com', 'bob@y.com'])
    );
  });
});
