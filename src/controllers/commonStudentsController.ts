import { Request, Response, NextFunction } from 'express';
import commonStudentsService from '../services/commonStudentsService';
import pool from '../db/pool';
import { toStringArray } from '../utils/typeGuards';
import { badRequest } from '../utils/helpers';
import { HttpStatus } from '../utils/constants';

async function commonStudentsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { teacher } = req.query;
    if (!teacher) return badRequest(next, 'At least one teacher query parameter is required');
    const teachers = toStringArray(teacher);
    const students = await commonStudentsService(pool, teachers);
    res.status(HttpStatus.OK).json({ students });
  } catch (err) {
    next(err);
  }
}

export default commonStudentsController;
