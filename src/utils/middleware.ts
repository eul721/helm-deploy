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
import { BuildModel } from '../models/db/build';
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
    req.params[PathParam.permissionId],
    resources.game,
    resources.branch,
    resources.build
  );
  RbacContext.set(res, rbacContext);
  return rbacContext;
}

export async function getGameResourcesFromRequest(
  req: Request
): Promise<{ game: Maybe<GameModel>; branch: Maybe<BranchModel>; build: Maybe<BuildModel> }> {
  const gameId = toIntOptional(req.params[PathParam.gameId]);
  const bdsTitleId = toIntOptional(req.params[PathParam.bdsGameId]);
  let game: Maybe<GameModel>;
  if (gameId) {
    game = await GameModel.findOne({ where: { id: gameId } });
  } else if (bdsTitleId) {
    game = await GameModel.findOne({ where: { bdsTitleId } });
  }

  const branchId = toIntOptional(req.params[PathParam.branchId]);
  const bdsBranchId = toIntOptional(req.params[PathParam.bdsBranchId]);
  let branch: Maybe<BranchModel>;
  if (branchId) {
    branch = await BranchModel.findOne({ where: { id: branchId } });
  } else if (bdsBranchId) {
    branch = await BranchModel.findOne({ where: { bdsBranchId } });
  }

  const buildId = toIntOptional(req.params[PathParam.buildId]);
  const bdsBuildId = toIntOptional(req.params[PathParam.bdsBuildId]);
  let build: Maybe<BuildModel>;
  if (buildId) {
    build = await BuildModel.findOne({ where: { id: buildId } });
  } else if (bdsBuildId) {
    build = await BuildModel.findOne({ where: { bdsBuildId } });
  }

  return { game, branch, build };
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
    resources.branch,
    resources.build
  );
  PlayerContext.set(res, playerContext);
  return playerContext;
}

export async function createResourceContext(req: Request, res: Response): Promise<ResourceContext> {
  const resources = await getGameResourcesFromRequest(req);
  const resourceContext = new ResourceContext(resources.game, resources.branch, resources.build);
  res.locals.resourceContext = resourceContext;
  return resourceContext;
}
