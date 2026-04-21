jest.mock('../../src/services/registerService');

import request from 'supertest';
import express from 'express';
import errorHandler from '../../src/middleware/errorHandler';
import registerService from '../../src/services/registerService';

import registerController from '../../src/controllers/registerController';

const app = express();
app.use(express.json());
app.post('/api/register', registerController);
app.use(errorHandler);

const mockRegisterService = registerService as jest.MockedFunction<typeof registerService>;

describe('POST /api/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 204 on success', async () => {
    mockRegisterService.mockResolvedValueOnce();
    const res = await request(app)
      .post('/api/register')
      .send({ teacher: 'teacher@gmail.com', students: ['s@gmail.com'] });
    expect(res.status).toBe(204);
  });

  it('returns 400 if teacher is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ students: ['s@gmail.com'] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 if students is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ teacher: 'teacher@gmail.com' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 if students is empty array', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ teacher: 'teacher@gmail.com', students: [] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 500 if service throws', async () => {
    mockRegisterService.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/register')
      .send({ teacher: 'teacher@gmail.com', students: ['s@gmail.com'] });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});
