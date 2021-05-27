import { Router } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/game';
import { getQueryParamValue, sendMessageResponse, sendServiceResponse } from '../utils/http';

export const downloadApiRouter = Router();

downloadApiRouter.use(getAuthenticateMiddleware(), getAuthorizePlayerMiddleware());

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
downloadApiRouter.get('/', async (_req, res) => {
  const response = await GameService.getAllGames();
  sendServiceResponse(response, res);
});

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
downloadApiRouter.get('/download', async (_req, res) => {
  const response = await GameService.getOwnedGames(UserContext.get(res));
  sendServiceResponse(response, res);
});

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
downloadApiRouter.get(`/:${PathParam.gameId}/branches`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  if (!Number.isNaN(gameId)) {
    const response = await GameService.getBranches({ id: gameId }, UserContext.get(res));
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing title query param');
  }
});

/**
 * @api {GET} /games/:gameId/branches/:branchId Get specific game branch
 * @apiName GetSpecificBranch
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get game download data of a specific game branch
 *
 * @apiParam (Query) Title title id of the game
 * @apiParam (Query) {String} Branch branch id of the requested branch
 * @apiParam (Query) Password password for the branch, if applicable
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get(`/:${PathParam.gameId}/:${PathParam.branchId}`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  const branchId = Number.parseInt(req.params[PathParam.branchId], 10);
  const password = getQueryParamValue(req, 'password');
  if (!Number.isNaN(gameId) && !Number.isNaN(branchId)) {
    const response = await GameService.getGameDownloadModel(UserContext.get(res), { id: gameId }, branchId, password);
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing title or branch query param');
  }
});
