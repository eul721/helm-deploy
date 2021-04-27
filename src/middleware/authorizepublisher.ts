import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { Middleware, middlewareExceptionWrapper, supplementStudioUserModel, useDummyAuth } from './auth.utils';

async function authorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = await supplementStudioUserModel(res.locals.userContext as UserContext);
  if (!context.studioUserModel) {
    res.status(HttpCode.NOT_FOUND).json({ message: 'User not found in RBAC' });
    return;
  }
  res.locals.userContext = context;
  next();
}

async function dummyAuthorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  let model = await UserModel.findOne({ where: { externalId: 'debug@admin' } });
  model = model ?? (await UserModel.findByPk(1)) ?? (await UserModel.create());
  res.locals.userContext = { studioUserModel: model } as UserContext;
  next();
}

export function getAuthorizePublisherMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without publisher-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePublisherMiddleware);
  }

  return middlewareExceptionWrapper(authorizePublisherMiddleware);
}
