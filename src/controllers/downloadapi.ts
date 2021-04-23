import { Router } from 'express';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/gameservice';
import { UserContext } from '../services/usercontext';

export const downloadApiRouter = Router();

/**
 * Validate user (player) credentials
 */
downloadApiRouter.use((_req, res, next) => {
  // TODO external service call to verify user, set required information (possibly just id) as request local data
  const userContext: UserContext = { authenticated: true };
  res.locals.userContext = userContext;

  next();
});

/**
 * @api {GET} /api/games Get games catalogue
 * @apiName GetAllGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get all games
 *
 * @apiUse T2Auth
 */
downloadApiRouter.get('/games', async (_req, res) => {
  const response = await GameService.getAllGames();
  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /api/games/download Get owned games
 * @apiName GetOwnedGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get game download data for the list of games the user is authorized to view, returns only public-release branches
 *
 * @apiUse T2Auth
 */
downloadApiRouter.get('/games/download', async (_req, res) => {
  const response = await GameService.getOwnedGames(res.locals.userContext);
  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /api/games/branches Get Branches
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title (title contentful id passed in as query param, 'title')
 *
 * @apiUse T2Auth
 */
downloadApiRouter.get('/games/branches', async (req, res) => {
  const titleContentfulId = req.query.title?.toString();
  if (titleContentfulId) {
    const response = await GameService.getBranches(titleContentfulId, res.locals.userContext);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});

/**
 * @api {GET} /games/download/branch Get Game Branch
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get game download data of a specific game branch (title, branch contentful id passed in as query param, with optional password)
 *
 * @apiUse T2Auth
 */
downloadApiRouter.get('/games/download/branch', async (req, res) => {
  const titleContentfulId = req.query.title?.toString();
  const branchContentfulId = req.query.branch?.toString();
  const password = req.query.password?.toString();
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
