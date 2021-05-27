import { NextFunction, Request, Response } from 'express';
import { authBearerPrefix } from '../configuration/httpconfig';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import { validateToken } from '../utils/auth';
import { getHeaderParamValue, sendMessageResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyAuthenticateMiddleware } from './dummymiddleware';

/**
 * @apiDefine AuthenticateMiddleware
 * @apiDescription Handles token based authentication
 * @apiVersion 0.0.1
 * @apiHeader {String} Authorization='Bearer token' JWT of the user
 */
async function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const bearerToken = getHeaderParamValue(req, 'authorization');
  if (!bearerToken || !bearerToken.startsWith(authBearerPrefix)) {
    sendMessageResponse(res, HttpCode.UNAUTHORIZED, 'Missing or malformed token');
    return;
  }

  const token = bearerToken.substr(authBearerPrefix.length);
  const validateResult = await validateToken(token);

  if (!validateResult.valid || !validateResult.userID) {
    sendMessageResponse(res, HttpCode.FORBIDDEN, 'Invalid token');
    return;
  }

  res.locals.userContext = new UserContext(validateResult.userID, validateResult.payload);
  next();
}

export function getAuthenticateMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without authenticate');
    return middlewareExceptionWrapper(dummyAuthenticateMiddleware);
  }
  return middlewareExceptionWrapper(authenticateMiddleware);
}
