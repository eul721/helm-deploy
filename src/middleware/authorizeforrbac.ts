import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { NextFunction, Request, Response } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { warn } from '../logger';
import { RbacContext } from '../models/auth/rbaccontext';
import { RbacResource } from '../models/auth/rbacresource';
import { UserContext } from '../models/auth/usercontext';
import { DivisionPermissionType } from '../models/db/permission';
import { HttpCode } from '../models/http/httpcode';
import { RbacService } from '../services/rbac';
import { sendMessageResponse } from '../utils/http';
import { getResourceOwnerId, Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyAuthorizeForRbacMiddleware } from './dummymiddleware';

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
  const rbacContext = new RbacContext(
    Number.parseInt(req.params[PathParam.divisionId], 10),
    Number.parseInt(req.params[PathParam.groupId], 10),
    Number.parseInt(req.params[PathParam.roleId], 10),
    Number.parseInt(req.params[PathParam.userId], 10),
    req.params[PathParam.gameId],
    req.params[PathParam.permissionId]
  );

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

  const hasPermission = RbacService.hasDivisionPermission(UserContext.get(res), permission, targetDivisionId);
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
