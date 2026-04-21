import { Request, Response, NextFunction } from 'express';
import suspendService from '../services/suspendService';
import pool from '../db/pool';
import { isString } from '../utils/typeGuards';
import { badRequest } from '../utils/helpers';
import { HttpStatus } from '../utils/constants';

async function suspendController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { student } = req.body;
    if (!isString(student)) return badRequest(next, 'student is required');
    await suspendService(pool, student);
    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (err) {
    next(err);
  }
}

export default suspendController;
