import { Request, Response, NextFunction } from 'express';
import registerService from '../services/registerService';
import pool from '../db/pool';
import { isString, isNonEmptyStringArray } from '../utils/typeGuards';
import { badRequest } from '../utils/helpers';
import { HttpStatus } from '../utils/constants';

async function registerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { teacher, students } = req.body;
    if (!isString(teacher)) return badRequest(next, 'teacher is required');
    if (!isNonEmptyStringArray(students)) return badRequest(next, 'students must be a non-empty array of strings');
    await registerService(pool, teacher, students);
    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (err) {
    next(err);
  }
}

export default registerController;
