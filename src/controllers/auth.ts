import { NextFunction } from 'express';

/**
 * @apiDefine T2Auth
 * @apiVersion  0.0.1
 * @apiHeader (Auth) {String} X-T2GP-AUTH Authentication for Publisher Services. [Placeholder]
 * No Authorization implemented yet
 */
export function basicAuth() {
  return (_req: Express.Request, _res: Express.Response, next: NextFunction) => {
    next();
  };
}
