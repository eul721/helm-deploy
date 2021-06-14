import { NextFunction, Request, Response } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { SampleDatabase } from '../utils/sampledatabase';
import { createPlayerContext, createRbacContext, Middleware } from '../utils/middleware';
import { ResourceContext } from '../models/auth/resourcecontext';

export const dummyMiddleware: Middleware = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export async function dummyAuthenticateMiddleware(_req: Request, res: Response, next: NextFunction) {
  AuthenticateContext.set(res, new AuthenticateContext('', SampleDatabase.creationData.debugAdminEmail, 'dev-login'));
  next();
}

export async function dummyAuthorizePlayerMiddleware(req: Request, res: Response, next: NextFunction) {
  createPlayerContext(req, res);
  next();
}

export async function dummyAuthorizePublisherMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next();
}

export async function dummyAuthorizeForRbacMiddleware(req: Request, res: Response, next: NextFunction) {
  createRbacContext(req, res);
  next();
}

export async function dummyAuthorizeResourceMiddleware(req: Request, res: Response, next: NextFunction) {
  const resourceContext = new ResourceContext(
    { id: Number.parseInt(req.params[PathParam.gameId], 10) },
    { id: Number.parseInt(req.params[PathParam.branchId], 10) }
  );
  res.locals.resourceContext = resourceContext;
  next();
}
