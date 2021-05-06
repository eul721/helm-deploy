import { Router } from 'express';
import { httpConfig } from '../configuration/httpconfig';
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
 * @apiDescription Get branch list for a specified title (title contentful id passed in as query param, 'title')
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get('/branches', async (req, res) => {
  const titleContentfulId = getQueryParamValue(req, httpConfig.TITLE_PARAM);
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
 * @apiDescription Get game download data of a specific game branch (title, branch contentful id passed in as query param, with optional password)
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
downloadApiRouter.get('/download/branch', async (req, res) => {
  const titleContentfulId = getQueryParamValue(req, httpConfig.TITLE_PARAM);
  const branchContentfulId = getQueryParamValue(req, httpConfig.BRANCH_PARAM);
  const password = getQueryParamValue(req, httpConfig.PASSWORD_PARAM);
  if (titleContentfulId) {
    const response = await GameService.getGameDownloadModel(
      res.locals.userContext,
      titleContentfulId,
      branchContentfulId,
      password
    );
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});
