import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../configuration/envconfig';
import { PathParam } from '../configuration/httpconfig';
import { error } from '../logger';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { PlayerContext } from '../models/auth/playercontext';
import { RbacContext } from '../models/auth/rbaccontext';
import { RbacResource } from '../models/auth/rbacresource';
import { ResourceContext } from '../models/auth/resourcecontext';
import { BranchModel } from '../models/db/branch';
import { GameModel } from '../models/db/game';
import { HttpCode } from '../models/http/httpcode';
import { getHeaderParamValue, sendMessageResponse } from './http';
import { toIntOptional } from './service';

/**
 * Type defining middleware
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function useDummyAuth(): boolean {
  return envConfig.isDev() && envConfig.ALLOW_UNAUTHORIZED;
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

export async function createRbacContext(req: Request, res: Response): Promise<RbacContext> {
  const resources = await getGameResourcesFromRequest(req);
  const rbacContext = new RbacContext(
    toIntOptional(req.params[PathParam.divisionId]),
    toIntOptional(req.params[PathParam.groupId]),
    toIntOptional(req.params[PathParam.roleId]),
    toIntOptional(req.params[PathParam.userId]),
    resources.game,
    req.params[PathParam.permissionId]
  );
  RbacContext.set(res, rbacContext);
  return rbacContext;
}

export async function getGameResourcesFromRequest(
  req: Request
): Promise<{ game: Maybe<GameModel>; branch: Maybe<BranchModel> }> {
  const gameId = toIntOptional(req.params[PathParam.gameId]);
  const branchId = toIntOptional(req.params[PathParam.branchId]);
  if (getHeaderParamValue(req, 'useBdsIds')) {
    const game = gameId ? await GameModel.findOne({ where: { bdsTitleId: gameId } }) : undefined;
    const branch = branchId ? await BranchModel.findOne({ where: { bdsBranchId: branchId } }) : undefined;
    return { game, branch };
  }

  const game = gameId ? await GameModel.findOne({ where: { id: gameId } }) : undefined;
  const branch = branchId ? await BranchModel.findOne({ where: { id: branchId } }) : undefined;
  return { game, branch };
}

export async function createPlayerContext(req: Request, res: Response): Promise<PlayerContext> {
  const deviceId = getHeaderParamValue(req, 'deviceId');
  const deviceName = getHeaderParamValue(req, 'deviceName');
  const resources = await getGameResourcesFromRequest(req);
  const playerContext = new PlayerContext(
    AuthenticateContext.get(res).bearerToken,
    deviceId,
    deviceName,
    resources.game,
    resources.branch
  );
  PlayerContext.set(res, playerContext);
  return playerContext;
}

export async function createResourceContext(req: Request, res: Response): Promise<ResourceContext> {
  const resources = await getGameResourcesFromRequest(req);
  const resourceContext = new ResourceContext(resources.game, resources.branch);
  res.locals.resourceContext = resourceContext;
  return resourceContext;
}
