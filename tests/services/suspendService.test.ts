import suspendService from '../../src/services/suspendService';

describe('suspendService', () => {
  let mockPool: { execute: jest.Mock };

  beforeEach(() => {
    mockPool = { execute: jest.fn() };
  });

  it('sets is_suspended=TRUE for existing student', async () => {
    mockPool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await expect(suspendService(mockPool as any, 'student@gmail.com')).resolves.toBeUndefined();
    expect(mockPool.execute).toHaveBeenCalledWith(
      'UPDATE students SET is_suspended = TRUE WHERE email = ?',
      ['student@gmail.com']
    );
  });

  it('throws 404 error if student not found (affectedRows=0)', async () => {
    mockPool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
    await expect(suspendService(mockPool as any, 'missing@gmail.com')).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('missing@gmail.com'),
    });
  });

  it('executes exactly one UPDATE query', async () => {
    mockPool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await suspendService(mockPool as any, 'student@gmail.com');
    expect(mockPool.execute).toHaveBeenCalledTimes(1);
  });
});
