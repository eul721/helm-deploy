import { NextFunction, Request, Response } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { warn } from '../logger';
import { AdminRequirements } from '../models/auth/adminrequirements';
import { ResourceContext } from '../models/auth/resourcecontext';
import { UserContext } from '../models/auth/usercontext';
import { GameModel } from '../models/db/game';
import { ResourcePermissionType } from '../models/db/permission';
import { HttpCode } from '../models/http/httpcode';
import { RbacService } from '../services/rbac';
import { checkRequiredPermission } from '../utils/auth';
import { sendMessageResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyAuthorizeResourceMiddleware } from './dummymiddleware';

/**
 * @apiDefine AuthorizeResourceAccessMiddleware
 * @apiDescription Checks if the caller has required permissions to modify resource
 * @apiVersion 0.0.1
 */
async function resourceAccessAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  basePermission: ResourcePermissionType,
  adminRequirements?: AdminRequirements
) {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  if (Number.isNaN(gameId)) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, `Passed in game id is not a number: ${gameId}`);
    return;
  }

  const game = await GameModel.findOne({ where: { id: gameId } });
  if (!game) {
    sendMessageResponse(res, HttpCode.NOT_FOUND, `Cannot find game with given id ${gameId}`);
    return;
  }

  const branchId = Number.parseInt(req.params[PathParam.branchId], 10);
  const requiredRights = checkRequiredPermission(basePermission, game, branchId, adminRequirements);

  const hasPermission = RbacService.hasResourcePermission(UserContext.get(res), { id: gameId }, requiredRights);
  if (!hasPermission) {
    sendMessageResponse(res, HttpCode.FORBIDDEN, 'User does not have the required permissions');
    return;
  }

  res.locals.resourceContext = new ResourceContext(gameId, branchId);
  next();
}

export function getAuthorizeForResourceMiddleware(
  permission: ResourcePermissionType,
  adminRequirements?: AdminRequirements
): Middleware {
  if (useDummyAuth()) {
    warn('Running without resource auth');
    return middlewareExceptionWrapper(dummyAuthorizeResourceMiddleware);
  }

  return middlewareExceptionWrapper(async (req: Request, res: Response, next: NextFunction) => {
    await resourceAccessAuth(req, res, next, permission, adminRequirements);
  });
}
