import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/game';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/publisher/branches Get Branches
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title (title contentful id passed in as query param, 'title')
 *
 * @apiUse T2Auth
 */
publishApiRouter.get('/branches', async (req, res) => {
  const titleContentfulId = req.query.title?.toString();
  if (titleContentfulId) {
    const response = await GameService.getBranches(titleContentfulId, res.locals.userContext);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});
