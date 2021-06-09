import { NextFunction, Request, Response } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { info, warn } from '../logger';
import { AdminRequirements } from '../models/auth/adminrequirements';
import { ResourceContext } from '../models/auth/resourcecontext';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { ResourcePermissionType } from '../models/db/permission';
import { HttpCode } from '../models/http/httpcode';
import { RbacService } from '../services/rbac/basic';
import { checkRequiredPermission } from '../utils/auth';
import { sendMessageResponse, sendServiceResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyAuthorizeResourceMiddleware } from './dummymiddleware';
import { envConfig } from '../configuration/envconfig';
import { malformedRequestPastValidation } from '../models/http/serviceresponse';

export function createResourceContext(req: Request, res: Response): ResourceContext {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  const branchId = Number.parseInt(req.params[PathParam.branchId], 10);
  const resourceContext = new ResourceContext(gameId, branchId);
  res.locals.resourceContext = resourceContext;
  return resourceContext;
}

/**
 * @apiDefine AuthorizeResourceAccessMiddleware
 * @apiDescription Checks if the caller has required permissions to modify resource, sets ResourceContext
 * @apiVersion 0.0.1
 */
async function resourceAccessAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  basePermission: ResourcePermissionType,
  adminRequirements?: AdminRequirements
) {
  const resourceContext = createResourceContext(req, res);
  if (!resourceContext.gameUid) {
    sendMessageResponse(
      res,
      HttpCode.BAD_REQUEST,
      `Passed in game id is not a number: ${req.params[PathParam.gameId]}`
    );
    return;
  }

  const game = await ResourceContext.get(res).fetchGameModel();
  if (!game) {
    sendMessageResponse(res, HttpCode.NOT_FOUND, `Cannot find game with given id ${req.params[PathParam.gameId]}`);
    return;
  }

  const branch = await ResourceContext.get(res).fetchBranchModel();
  if (branch && branch.ownerId !== game.id) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, `Requested branch ${branch.id} does not belong to title ${game.id}`);
    return;
  }

  const requiredRights = checkRequiredPermission(
    basePermission,
    game,
    await resourceContext.fetchBranchModel(),
    adminRequirements
  );

  const userId = (await AuthenticateContext.get(res).fetchStudioUserModel())?.id;
  if (!userId) {
    sendServiceResponse(malformedRequestPastValidation(), res);
    return;
  }

  const hasPermission = await RbacService.hasResourcePermission(userId, { id: game.id }, requiredRights);
  if (hasPermission.code !== HttpCode.OK) {
    if (envConfig.TEMP_FLAG_VERSION_1_0_AUTH_OFF) {
      info('resourceAccessAuth would have rejected the request here if rbac check was not disabled');
    } else {
      sendMessageResponse(res, HttpCode.FORBIDDEN, 'User does not have the required permissions');
      return;
    }
  }

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