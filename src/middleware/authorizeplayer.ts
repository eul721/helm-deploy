import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from './auth.utils';

async function authorizePlayerMiddleware(_req: Request, res: Response, next: NextFunction) {
  const userContext = res.locals.userContext as UserContext;
  // todo: getting entitlements should be here
  res.locals.userContext = { ...userContext } as UserContext;
  next();
}

async function dummyAuthorizePlayerMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.locals.userContext = { ownedTitles: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] } as UserContext;
  next();
}

export function getAuthorizePlayerMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without player-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePlayerMiddleware);
  }

  return middlewareExceptionWrapper(authorizePlayerMiddleware);
}
