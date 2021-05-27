import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../configuration/envconfig';
import { error } from '../logger';
import { RbacContext } from '../models/auth/rbaccontext';
import { RbacResource } from '../models/auth/rbacresource';
import { HttpCode } from '../models/http/httpcode';
import { sendMessageResponse } from './http';

/**
 * Type defining middleware
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function useDummyAuth(): boolean {
  return envConfig.isDev() && envConfig.ALLOW_UNAUTHORIZED === 'true';
}

export const middlewareExceptionWrapper = (middleware: Middleware): Middleware => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      middleware(req, res, next);
    } catch (err) {
      error('Encountered error in middleware, error=%s', err);
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Exception during pre-processing');
    }
  };
};

export async function getResourceOwnerId(rbacContext: RbacContext, resource: RbacResource): Promise<Maybe<number>> {
  switch (resource) {
    case RbacResource.DIVISION:
      return (await rbacContext.fetchDivisionModel())?.id;
    case RbacResource.GROUP:
      return (await rbacContext.fetchGroupModel())?.ownerId;
    case RbacResource.ROLE:
      return (await rbacContext.fetchRoleModel())?.ownerId;
    case RbacResource.USER:
      return (await rbacContext.fetchUserModel())?.ownerId;
    case RbacResource.GAME:
      return (await rbacContext.fetchGameModel())?.ownerId;
    default:
      return undefined;
  }
}
