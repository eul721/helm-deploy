import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../configuration/envconfig';
import { PathParam } from '../configuration/httpconfig';
import { error } from '../logger';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { PlayerContext } from '../models/auth/playercontext';
import { RbacContext } from '../models/auth/rbaccontext';
import { RbacResource } from '../models/auth/rbacresource';
import { BranchUniqueIdentifier } from '../models/db/branch';
import { GameUniqueIdentifier } from '../models/db/game';
import { HttpCode } from '../models/http/httpcode';
import { getHeaderParamValue, sendMessageResponse } from './http';

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

export function createRbacContext(req: Request, res: Response): RbacContext {
  const rbacContext = new RbacContext(
    Number.parseInt(req.params[PathParam.divisionId], 10),
    Number.parseInt(req.params[PathParam.groupId], 10),
    Number.parseInt(req.params[PathParam.roleId], 10),
    Number.parseInt(req.params[PathParam.userId], 10),
    Number.parseInt(req.params[PathParam.gameId], 10),
    req.params[PathParam.permissionId]
  );
  RbacContext.set(res, rbacContext);
  return rbacContext;
}

export function createPlayerContext(req: Request, res: Response): PlayerContext {
  const deviceId = getHeaderParamValue(req, 'deviceId');
  const deviceName = getHeaderParamValue(req, 'deviceName');
  const bdsGameId = Number.parseInt(req.params[PathParam.bdsTitle], 10);
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  let gameUid: Maybe<GameUniqueIdentifier> = !Number.isNaN(bdsGameId) ? { bdsTitleId: bdsGameId } : undefined;
  gameUid = gameUid ?? !Number.isNaN(gameId) ? { id: gameId } : undefined;

  const bdsbranchId = Number.parseInt(req.params[PathParam.bdsBranch], 10);
  const branchId = Number.parseInt(req.params[PathParam.branchId], 10);
  let branchUid: Maybe<BranchUniqueIdentifier> = !Number.isNaN(bdsbranchId) ? { bdsBranchId: bdsbranchId } : undefined;
  branchUid = branchUid ?? !Number.isNaN(branchId) ? { id: branchId } : undefined;

  const playerContext = new PlayerContext(
    AuthenticateContext.get(res).bearerToken,
    deviceId,
    deviceName,
    gameUid,
    branchUid
  );
  PlayerContext.set(res, playerContext);
  return playerContext;
}
