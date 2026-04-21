import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notificationService';
import pool from '../db/pool';
import { isString, badRequest } from '../utils/typeGuards';

async function notificationController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { teacher, notification } = req.body;
    if (!isString(teacher)) return badRequest(next, 'teacher is required');
    if (!isString(notification)) return badRequest(next, 'notification is required');
    const recipients = await notificationService(pool, teacher, notification);
    res.json({ recipients });
  } catch (err) {
    next(err);
  }
}

export default notificationController;
