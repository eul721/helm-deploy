import { NextFunction, Request, Response } from 'express';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { SampleDatabase } from '../utils/sampledatabase';
import { createPlayerContext, createRbacContext, createResourceContext, Middleware } from '../utils/middleware';

export const dummyMiddleware: Middleware = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export async function dummyAuthenticateMiddleware(_req: Request, res: Response, next: NextFunction) {
  AuthenticateContext.set(res, new AuthenticateContext('', SampleDatabase.creationData.debugAdminEmail, 'dev-login'));
  next();
}

export async function dummyAuthorizePlayerMiddleware(req: Request, res: Response, next: NextFunction) {
  await createPlayerContext(req, res);
  next();
}

export async function dummyAuthorizePublisherMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next();
}

export async function dummyAuthorizeForRbacMiddleware(req: Request, res: Response, next: NextFunction) {
  await createRbacContext(req, res);
  next();
}

export async function dummyAuthorizeResourceMiddleware(req: Request, res: Response, next: NextFunction) {
  await createResourceContext(req, res);
  next();
}
