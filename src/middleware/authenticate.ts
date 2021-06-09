import { NextFunction, Request, Response } from 'express';
import { authBearerPrefix } from '../configuration/httpconfig';
import { debug, warn } from '../logger';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { HttpCode } from '../models/http/httpcode';
import { validateToken } from '../utils/auth';
import { getHeaderParamValue, sendMessageResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyAuthenticateMiddleware } from './dummymiddleware';

/**
 * @apiDefine AuthenticateMiddleware
 * @apiDescription Handles token based authentication, sets AuthenticateContext
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
  debug(`validate result: ${validateResult.valid}, userId: ${validateResult.userId}`);

  if (!validateResult.valid || !validateResult.userId || !validateResult.accountType) {
    sendMessageResponse(res, HttpCode.FORBIDDEN, 'Invalid token');
    return;
  }

  AuthenticateContext.set(
    res,
    new AuthenticateContext(bearerToken, validateResult.userId, validateResult.accountType, validateResult.payload)
  );
  next();
}

export function getAuthenticateMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without authenticate');
    return middlewareExceptionWrapper(dummyAuthenticateMiddleware);
  }
  return middlewareExceptionWrapper(authenticateMiddleware);
}
