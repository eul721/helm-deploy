import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { SampleDatabase } from '../tests/testutils';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from './utils';

/**
 * @apiDefine AuthorizePublisherMiddleware
 * @apiVersion 0.0.1
 */
async function authorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = res.locals.userContext as UserContext;
  if (!(await context.getStudioUserModel())) {
    res.status(HttpCode.NOT_FOUND).json({ message: 'User not found in RBAC' });
    return;
  }
  res.locals.userContext = context;
  next();
}

async function dummyAuthorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = new UserContext(SampleDatabase.debugAdminEmail);

  // replace the studio model getter with a debug-version if running with auth disabled
  context.getStudioUserModel = async () => {
    let model = await UserModel.findOne({ where: { externalId: SampleDatabase.debugAdminEmail } });
    model = model ?? (await UserModel.findByPk(1)) ?? (await UserModel.create());
    return model;
  };
  res.locals.userContext = context;
  next();
}

export function getAuthorizePublisherMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without publisher-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePublisherMiddleware);
  }

  return middlewareExceptionWrapper(authorizePublisherMiddleware);
}
