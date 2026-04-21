import { Request, Response, NextFunction } from 'express';
import commonStudentsService from '../services/commonStudentsService';
import pool from '../db/pool';
import { toStringArray, badRequest } from '../utils/typeGuards';

async function commonStudentsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { teacher } = req.query;
    if (!teacher) return badRequest(next, 'At least one teacher query parameter is required');
    const teachers = toStringArray(teacher);
    const students = await commonStudentsService(pool, teachers);
    res.json({ students });
  } catch (err) {
    next(err);
  }
}

export default commonStudentsController;
