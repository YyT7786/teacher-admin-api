jest.mock('../../src/services/commonStudentsService');

import request from 'supertest';
import express from 'express';
import errorHandler from '../../src/middleware/errorHandler';
import commonStudentsService from '../../src/services/commonStudentsService';
import commonStudentsController from '../../src/controllers/commonStudentsController';

const app = express();
app.get('/api/commonstudents', commonStudentsController);
app.use(errorHandler);

const mockService = commonStudentsService as jest.MockedFunction<typeof commonStudentsService>;

describe('GET /api/commonstudents', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with students array', async () => {
    mockService.mockResolvedValueOnce(['s1@gmail.com', 's2@gmail.com']);
    const res = await request(app).get('/api/commonstudents?teacher=teacherken%40gmail.com');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ students: ['s1@gmail.com', 's2@gmail.com'] });
  });

  it('returns 400 if no teacher param provided', async () => {
    const res = await request(app).get('/api/commonstudents');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('passes multiple teacher emails to service as array', async () => {
    mockService.mockResolvedValueOnce(['common@gmail.com']);
    await request(app).get('/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com');
    expect(commonStudentsService).toHaveBeenCalledWith(
      expect.anything(),
      ['teacherken@gmail.com', 'teacherjoe@gmail.com']
    );
  });

  it('wraps single teacher param in array', async () => {
    mockService.mockResolvedValueOnce([]);
    await request(app).get('/api/commonstudents?teacher=teacherken%40gmail.com');
    expect(commonStudentsService).toHaveBeenCalledWith(
      expect.anything(),
      ['teacherken@gmail.com']
    );
  });

  it('returns 500 if service throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockService.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/commonstudents?teacher=teacherken%40gmail.com');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});
