import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { RbacResource } from '../models/auth/rbacresource';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { DivisionPermissionType } from '../models/db/permission';
import { HttpCode } from '../models/http/httpcode';
import { RbacService } from '../services/rbac/basic';
import { sendMessageResponse, sendServiceResponse } from '../utils/http';
import {
  createRbacContext,
  getResourceOwnerId,
  Middleware,
  middlewareExceptionWrapper,
  useDummyAuth,
} from '../utils/middleware';
import { dummyAuthorizeForRbacMiddleware } from './dummymiddleware';
import { malformedRequestPastValidation } from '../models/http/serviceresponse';

/**
 * @apiDefine AuthorizeForRbacMiddleware
 * @apiDescription Checks if the caller has required permission in the targeted division
 * @apiVersion 0.0.1
 */
async function rbacRequiredPermissionAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  permission: DivisionPermissionType,
  primaryResource: RbacResource,
  secondaryResource?: { resource: RbacResource; allowDifferentOwner: boolean }
) {
  const rbacContext = createRbacContext(req, res);
  const targetDivisionId: Maybe<number> = await getResourceOwnerId(rbacContext, primaryResource);

  if (secondaryResource) {
    const secondaryTargetDivisionId: Maybe<number> = await getResourceOwnerId(rbacContext, secondaryResource.resource);

    if (!secondaryTargetDivisionId) {
      sendMessageResponse(
        res,
        HttpCode.NOT_FOUND,
        `Could not find the requested resource of type ${secondaryResource.resource}`
      );
      return;
    }

    if (targetDivisionId !== secondaryTargetDivisionId && !secondaryResource.allowDifferentOwner) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Resources from different divisions cannot be associated');
      return;
    }
  }

  if (!targetDivisionId) {
    sendMessageResponse(res, HttpCode.NOT_FOUND, `Could not find the requested resource of type ${primaryResource}`);
    return;
  }

  const userModel = await AuthenticateContext.get(res).fetchStudioUserModel();
  if (!userModel) {
    sendServiceResponse(malformedRequestPastValidation(), res);
    return;
  }

  const hasPermission = RbacService.hasDivisionPermission(userModel, permission, targetDivisionId);
  if (!hasPermission) {
    sendMessageResponse(res, HttpCode.FORBIDDEN, 'User does not have the required permissions');
    return;
  }

  res.locals.rbacContext = rbacContext;
  next();
}

export function getAuthorizeForRbacMiddleware(
  permission: DivisionPermissionType,
  primaryResource: RbacResource,
  secondaryResource?: { resource: RbacResource; allowDifferentOwner: boolean }
): Middleware {
  if (useDummyAuth()) {
    warn('Running without rbac-role auth');
    return middlewareExceptionWrapper(dummyAuthorizeForRbacMiddleware);
  }

  return middlewareExceptionWrapper(async (req: Request, res: Response, next: NextFunction) => {
    await rbacRequiredPermissionAuth(req, res, next, permission, primaryResource, secondaryResource);
  });
}
