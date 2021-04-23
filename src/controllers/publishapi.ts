import { Router } from 'express';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/gameservice';
import { UserContext } from '../services/usercontext';

export const publishApiRouter = Router();

/**
 * Validate division members credentials
 */
publishApiRouter.use((_req, res, next) => {
  // TODO external service call to verify user, set required information (possibly just id) as request local data
  const userContext: UserContext = { authenticated: true, studioUserId: 1 };
  res.locals.userContext = userContext;

  next();
});

/**
 * @api {GET} /division/games/branches Get Branches
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title (title contentful id passed in as query param, 'title')
 *
 * @apiUse T2Auth
 */
publishApiRouter.get('/games/branches', async (req, res) => {
  const titleContentfulId = req.query.title?.toString();
  if (titleContentfulId) {
    const response = await GameService.getBranches(titleContentfulId, res.locals.userContext);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});
