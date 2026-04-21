import commonStudentsService from '../../src/services/commonStudentsService';

describe('commonStudentsService', () => {
  let mockPool: { execute: jest.Mock };

  beforeEach(() => {
    mockPool = { execute: jest.fn() };
  });

  it('returns students registered to a single teacher', async () => {
    mockPool.execute.mockResolvedValueOnce([[
      { email: 'student1@gmail.com' },
      { email: 'student2@gmail.com' },
    ]]);
    const result = await commonStudentsService(mockPool as any, ['teacherken@gmail.com']);
    expect(result).toEqual(['student1@gmail.com', 'student2@gmail.com']);
  });

  it('returns students common to multiple teachers', async () => {
    mockPool.execute.mockResolvedValueOnce([[
      { email: 'common@gmail.com' },
    ]]);
    const result = await commonStudentsService(mockPool as any, ['teacherken@gmail.com', 'teacherjoe@gmail.com']);
    expect(result).toEqual(['common@gmail.com']);
  });

  it('returns empty array when no common students', async () => {
    mockPool.execute.mockResolvedValueOnce([[]]);
    const result = await commonStudentsService(mockPool as any, ['teacherken@gmail.com', 'teacherjoe@gmail.com']);
    expect(result).toEqual([]);
  });

  it('returns empty array immediately for empty teacher list', async () => {
    const result = await commonStudentsService(mockPool as any, []);
    expect(result).toEqual([]);
    expect(mockPool.execute).not.toHaveBeenCalled();
  });

  it('passes correct HAVING count matching number of teachers', async () => {
    mockPool.execute.mockResolvedValueOnce([[]]);
    await commonStudentsService(mockPool as any, ['t1@x.com', 't2@x.com', 't3@x.com']);
    expect(mockPool.execute).toHaveBeenCalledWith(
      expect.stringContaining('HAVING COUNT(DISTINCT t.id) = ?'),
      ['t1@x.com', 't2@x.com', 't3@x.com', 3]
    );
  });
});
