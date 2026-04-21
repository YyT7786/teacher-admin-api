jest.mock('../../src/services/notificationService');

import request from 'supertest';
import express from 'express';
import errorHandler from '../../src/middleware/errorHandler';
import notificationService from '../../src/services/notificationService';
import notificationController from '../../src/controllers/notificationController';

const app = express();
app.use(express.json());
app.post('/api/retrievefornotifications', notificationController);
app.use(errorHandler);

const mockService = notificationService as jest.MockedFunction<typeof notificationService>;

describe('POST /api/retrievefornotifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with recipients array', async () => {
    mockService.mockResolvedValueOnce(['student@gmail.com']);
    const res = await request(app)
      .post('/api/retrievefornotifications')
      .send({ teacher: 'teacher@gmail.com', notification: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ recipients: ['student@gmail.com'] });
  });

  it('returns 400 if teacher is missing', async () => {
    const res = await request(app)
      .post('/api/retrievefornotifications')
      .send({ notification: 'Hello' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 if notification is missing', async () => {
    const res = await request(app)
      .post('/api/retrievefornotifications')
      .send({ teacher: 'teacher@gmail.com' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('passes teacher and notification to service correctly', async () => {
    mockService.mockResolvedValueOnce([]);
    await request(app)
      .post('/api/retrievefornotifications')
      .send({ teacher: 'teacher@gmail.com', notification: 'Hello @m@gmail.com' });
    expect(notificationService).toHaveBeenCalledWith(
      expect.anything(),
      'teacher@gmail.com',
      'Hello @m@gmail.com'
    );
  });

  it('returns empty recipients array when no students eligible', async () => {
    mockService.mockResolvedValueOnce([]);
    const res = await request(app)
      .post('/api/retrievefornotifications')
      .send({ teacher: 'teacher@gmail.com', notification: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ recipients: [] });
  });

  it('returns 500 if service throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockService.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/retrievefornotifications')
      .send({ teacher: 'teacher@gmail.com', notification: 'Hello' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});
