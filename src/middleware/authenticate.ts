import { NextFunction, Request, Response } from 'express';
import { authBearerPrefix } from '../configuration/httpconfig';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import {
  dummyMiddleware,
  getHeaderParamValue,
  Middleware,
  middlewareExceptionWrapper,
  useDummyAuth,
  validateToken,
} from './utils';

/**
 * @apiDefine AuthenticateMiddleware
 * @apiDescription Handles token based authentication
 * @apiVersion 0.0.1
 * @apiHeader {String} Authorization='Bearer token' JWT of the user
 */
async function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const bearerToken = getHeaderParamValue(req, 'authorization');
  if (!bearerToken || !bearerToken.startsWith(authBearerPrefix)) {
    res.status(HttpCode.UNAUTHORIZED).send({ message: 'missing or malformed token' });
    return;
  }

  const token = bearerToken.substr(authBearerPrefix.length);
  const validateResult = await validateToken(token);

  if (!validateResult.valid || !validateResult.userID) {
    res.status(HttpCode.FORBIDDEN).json({ message: 'invalid token' });
    return;
  }

  res.locals.userContext = new UserContext(validateResult.userID, validateResult.payload);
  next();
}

export function getAuthenticateMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without authenticate');
    return dummyMiddleware;
  }
  return middlewareExceptionWrapper(authenticateMiddleware);
}
