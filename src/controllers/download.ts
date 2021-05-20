import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { getQueryParamValue } from '../middleware/utils';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/game';

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
  res.status(response.code).json(response.payload);
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
  const response = await GameService.getOwnedGames(res.locals.userContext);
  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /api/games/branches Get branches
 * @apiName GetAllBranches
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title
 *
 * @apiParam {String} title Title contentful id query param
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get('/branches', async (req, res) => {
  const titleContentfulId = getQueryParamValue(req, 'title');
  if (titleContentfulId) {
    const response = await GameService.getBranches(titleContentfulId, res.locals.userContext);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});

/**
 * @api {GET} /games/download/branch Get specific game branch
 * @apiName GetSpecificBranch
 * @apiGroup Download
 * @apiVersion  0.0.1
 * @apiDescription Get game download data of a specific game branch
 *
 * @apiParam {String} Title title id of the game
 * @apiParam {String} Branch branch id of the requested branch
 * @apiParam {String} Password password for the branch, if applicable
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get('/download/branch', async (req, res) => {
  const titleContentfulId = getQueryParamValue(req, 'title');
  const branchContentfulId = getQueryParamValue(req, 'branch');
  const password = getQueryParamValue(req, 'password');
  if (titleContentfulId) {
    const response = await GameService.getGameDownloadModel(
      res.locals.userContext,
      titleContentfulId,
      Number.parseInt(branchContentfulId || '', 10),
      password
    );
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});
