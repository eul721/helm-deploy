import { Router } from 'express';
import { PathParam, Segment } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/game';
import { sendMessageResponse, sendServiceResponse } from '../utils/http';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/publisher/games/:games/branches Get branches
 * @apiName GetBranches
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title, includes private branches
 *
 * @apiParam (Query) {String} title game contentful id
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.get(`/${Segment.games}/branches`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  if (!Number.isNaN(gameId)) {
    const response = await GameService.getBranches({ id: gameId }, UserContext.get(res));
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
  }
});
