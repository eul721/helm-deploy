import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { DivisionPermissionType } from '../models/db/permission';
import { HttpCode } from '../models/http/httpcode';
import { RbacService } from '../services/rbac';
import { dummyAuthorizeForRbacMiddleware } from './dummymiddleware';
import { getQueryParamValue, Middleware, middlewareExceptionWrapper, useDummyAuth } from './utils';

/**
 * @apiDefine AuthorizeForRbacMiddleware
 * @apiDescription Checks if the caller has required permission in the targeted division
 * @apiVersion 0.0.1
 * @apiParam {String} divisionId Optional division id the request targets, if not specified caller division is assumed
 */
async function rbacRequiredPermissionAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  permission: DivisionPermissionType
) {
  const context = res.locals.userContext as UserContext;
  const userModel = await context.fetchStudioUserModel();
  if (!userModel) {
    res.status(HttpCode.NOT_FOUND).json({ message: 'User not found in RBAC' });
    return;
  }

  const targetDivision = getQueryParamValue(req, 'divisionId') ?? '';
  let targetDivisionId = parseInt(targetDivision, 10);
  if (Number.isNaN(targetDivisionId)) {
    targetDivisionId = userModel.ownerId;
  }

  const isAdmin = RbacService.hasDivisionPermission(context, permission, targetDivisionId);
  if (!isAdmin) {
    res.status(HttpCode.FORBIDDEN).json({ message: 'User does not have the required permissions' });
    return;
  }

  context.targetDivisionId = targetDivisionId;
  res.locals.userContext = context;
  next();
}

export function getAuthorizeForRbacMiddleware(permission: DivisionPermissionType): Middleware {
  if (useDummyAuth()) {
    warn('Running without rbac-role auth');
    return middlewareExceptionWrapper(dummyAuthorizeForRbacMiddleware);
  }

  return middlewareExceptionWrapper(async (req: Request, res: Response, next: NextFunction) => {
    await rbacRequiredPermissionAuth(req, res, next, permission);
  });
}
