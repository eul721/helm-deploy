import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { HttpCode } from '../models/http/httpcode';
import { sendMessageResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyAuthorizePublisherMiddleware } from './dummymiddleware';

/**
 * @apiDefine AuthorizePublisherMiddleware
 * @apiDescription Handles basic studio user authentication (caller must be known to RBAC system)
 * @apiVersion 0.0.1
 */
async function authorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = AuthenticateContext.get(res);
  if (!(await context.fetchStudioUserModel())) {
    sendMessageResponse(res, HttpCode.NOT_FOUND, 'User not found in RBAC');
    return;
  }
  next();
}

export function getAuthorizePublisherMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without publisher-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePublisherMiddleware);
  }

  return middlewareExceptionWrapper(authorizePublisherMiddleware);
}
