import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import {
  dummyMiddleware,
  HTTP_AUTH_HEADER_TOKEN,
  Middleware,
  middlewareExceptionWrapper,
  useDummyAuth,
  validateToken,
} from './auth.utils';

async function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header(HTTP_AUTH_HEADER_TOKEN);
  if (!token) {
    res.status(HttpCode.UNAUTHORIZED).send({ message: 'missing token' });
    return;
  }

  const validateResult = await validateToken(token);

  if (!validateResult.valid) {
    res.status(HttpCode.FORBIDDEN).json({ message: 'invalid token' });
    return;
  }

  res.locals.userContext = { userId: validateResult.userID, identity: validateResult.payload } as UserContext;
  next();
}

export function getAuthenticateMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without authenticate');
    return dummyMiddleware;
  }
  return middlewareExceptionWrapper(authenticateMiddleware);
}
