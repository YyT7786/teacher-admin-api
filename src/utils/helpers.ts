import { HttpStatus } from './constants';

export function httpError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), { statusCode });
}

export function badRequest(next: (err: unknown) => void, message: string): void {
  next(httpError(HttpStatus.BAD_REQUEST, message));
}
