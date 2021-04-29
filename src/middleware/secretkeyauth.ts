import { NextFunction, Request, Response } from 'express';
import { HttpCode } from '../models/http/httpcode';

export const secretKeyAuth = (secretKey: string, headerParam: string, queryParam?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.header(headerParam) ?? (req.query[queryParam ?? ''] as string);
    if (!token) {
      res.status(HttpCode.UNAUTHORIZED).json({ message: 'unauthorized' });
      return;
    }

    if (token !== '' && token !== secretKey) {
      res.status(HttpCode.UNAUTHORIZED).json({ message: 'unauthorized' });
      return;
    }

    next();
  };
};
