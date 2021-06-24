import { Router } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { PlayerContext } from '../models/auth/playercontext';
import { LegacyDownloadDataRoot } from '../models/http/legacy_downloaddata';
import { DownloadData, DownloadDataResponse } from '../models/http/public/downloaddata';
import { PublicBranchResponse } from '../models/http/public/publicbranchdescription';
import { PublicGameResponse } from '../models/http/public/publicgamedescription';
import { ServiceResponse } from '../models/http/serviceresponse';
import { GameService } from '../services/game';
import { endpointServiceCallWrapper } from '../utils/service';

export const downloadApiRouter = Router();

downloadApiRouter.use(getAuthenticateMiddleware());

/**
 * @api {GET} /api/games Get games catalogue
 * @apiName GetAllGames
 * @apiGroup Download
 * @apiVersion 0.0.1
 * @apiDescription Get all games
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 *
 * @apiUse PublicGameResponse
 */
downloadApiRouter.get(
  '/',
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper<ServiceResponse<PublicGameResponse>>(async () => {
    return GameService.getAllPublicGames();
  })
);

/**
 * @api {GET} /api/games/download LEGACY Get owned games
 * @apiName LEGACYMETHOD
 * @apiGroup Download
 * @apiVersion 0.0.1
 * @apiDescription Get game download data for the list of games the user is authorized to view, returns only public-release branches
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get(
  '/download',
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper<ServiceResponse<LegacyDownloadDataRoot>>(async (_req, res) => {
    return GameService.legacyGetOwnedGames(PlayerContext.get(res));
  })
);

/**
 * @api {GET} /api/games/owned Get owned games
 * @apiName GetOwnedGames
 * @apiGroup Download
 * @apiVersion 0.0.1
 * @apiDescription Get game download data for the list of games the user is authorized to view, returns only public-release branches
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 *
 * @apiUse DownloadDataResponse
 */
downloadApiRouter.get(
  '/owned',
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper<ServiceResponse<DownloadDataResponse>>(async (_req, res) => {
    return GameService.getOwnedGames(PlayerContext.get(res));
  })
);

/**
 * @api {GET} /api/games/:gameId/branches Get branches
 * @apiName GetAllBranches
 * @apiGroup Download
 * @apiVersion 0.0.1
 * @apiDescription Get branch list for a specified title
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 *
 * @apiUse PublicBranchResponse
 */
downloadApiRouter.get(
  `/:${PathParam.gameId}/branches`,
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper<ServiceResponse<PublicBranchResponse>>(async (_req, res) => {
    return GameService.getBranches(PlayerContext.get(res));
  })
);

/**
 * @api {GET} /games/:gameId/branches/:branchId Get specific game branch
 * @apiName GetSpecificBranch
 * @apiGroup Download
 * @apiVersion 0.0.1
 * @apiDescription Get game download data of a specific game branch

 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * 
 * @apiUse DownloadData
 */
downloadApiRouter.get(
  `/:${PathParam.gameId}/:${PathParam.branchId}`,
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper<ServiceResponse<DownloadData>>(async (_req, res) => {
    return GameService.getGameDownloadModel(PlayerContext.get(res));
  })
);
