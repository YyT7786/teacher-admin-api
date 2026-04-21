import request from 'supertest';
import express from 'express';
import errorHandler from '../../src/middleware/errorHandler';

const app = express();
app.get('/error', (_req, _res, next) => {
  next(new Error('Something went wrong'));
});
app.get('/known-error', (_req, _res, next) => {
  next(Object.assign(new Error('Bad input'), { statusCode: 400 }));
});
app.use(errorHandler);

describe('errorHandler', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('logs the error to console.error for 500 responses', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(spy).toHaveBeenCalledWith(expect.any(Error));
  });

  it('does not log to console.error for known status errors', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/known-error');
    expect(res.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
});
