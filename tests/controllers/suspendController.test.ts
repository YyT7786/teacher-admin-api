jest.mock('../../src/services/suspendService');

import request from 'supertest';
import express from 'express';
import errorHandler from '../../src/middleware/errorHandler';
import suspendService from '../../src/services/suspendService';
import suspendController from '../../src/controllers/suspendController';

const app = express();
app.use(express.json());
app.post('/api/suspend', suspendController);
app.use(errorHandler);

const mockService = suspendService as jest.MockedFunction<typeof suspendService>;

describe('POST /api/suspend', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 204 on success', async () => {
    mockService.mockResolvedValueOnce();
    const res = await request(app).post('/api/suspend').send({ student: 'student@gmail.com' });
    expect(res.status).toBe(204);
  });

  it('returns 400 if student is missing', async () => {
    const res = await request(app).post('/api/suspend').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 404 if service throws 404', async () => {
    const err = Object.assign(new Error('Student not found: x@gmail.com'), { statusCode: 404 });
    mockService.mockRejectedValueOnce(err);
    const res = await request(app).post('/api/suspend').send({ student: 'x@gmail.com' });
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('x@gmail.com');
  });

  it('calls suspendService with correct email', async () => {
    mockService.mockResolvedValueOnce();
    await request(app).post('/api/suspend').send({ student: 'target@gmail.com' });
    expect(suspendService).toHaveBeenCalledWith(expect.anything(), 'target@gmail.com');
  });

  it('returns 500 if service throws unexpected error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockService.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).post('/api/suspend').send({ student: 'student@gmail.com' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});
