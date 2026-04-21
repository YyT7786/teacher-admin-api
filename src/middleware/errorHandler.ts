import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../utils/constants';

interface AppError extends Error {
  statusCode?: number;
}

function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) return next(err) as unknown as void;
  const status = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.statusCode ? err.message : 'An unexpected error occurred';
  if (!err.statusCode) console.error(err);
  res.status(status).json({ message });
}

export default errorHandler;
