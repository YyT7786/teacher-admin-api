import { Request, Response, NextFunction } from 'express';
import suspendService from '../services/suspendService';
import pool from '../db/pool';
import { isString, badRequest } from '../utils/typeGuards';

async function suspendController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { student } = req.body;
    if (!isString(student)) return badRequest(next, 'student is required');
    await suspendService(pool, student);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export default suspendController;
