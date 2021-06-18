import { Router } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { PlayerContext } from '../models/auth/playercontext';
import { GameService } from '../services/game';
import { endpointServiceCallWrapper } from '../utils/service';

export const downloadApiRouter = Router();

downloadApiRouter.use(getAuthenticateMiddleware());

/**
 * @api {GET} /api/games Get games catalogue
 * @apiName GetAllGames
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get all games
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get(
  '/',
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper(async () => {
    return GameService.getAllPublicGames();
  })
);

/**
 * @api {GET} /api/games/download Get owned games
 * @apiName GetOwnedGames
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get game download data for the list of games the user is authorized to view, returns only public-release branches
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get(
  '/download',
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.getOwnedGames(PlayerContext.get(res));
  })
);

/**
 * @api {GET} /api/games/:gameId/branches Get branches
 * @apiName GetAllBranches
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title
 *
 * @apiParam (Query) {String} title Title contentful id
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get(
  `/:${PathParam.gameId}/branches`,
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.getBranches(PlayerContext.get(res));
  })
);

/**
 * @api {GET} /games/:gameId/branches/:branchId Get specific game branch
 * @apiName GetSpecificBranch
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get game download data of a specific game branch

 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get(
  `/:${PathParam.gameId}/:${PathParam.branchId}`,
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.getGameDownloadModel(PlayerContext.get(res));
  })
);
