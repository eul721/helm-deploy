import { Router } from 'express';
import { httpConfig } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getQueryParamValue } from '../middleware/utils';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/game';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/publisher/branches Get branches
 * @apiName GetBranches
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title, includes private branches
 *
 * @apiParam {String} title game contentful id passed in as query param
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.get('/branches', async (req, res) => {
  const titleContentfulId = getQueryParamValue(req, httpConfig.TITLE_PARAM);
  if (titleContentfulId) {
    const response = await GameService.getBranches(titleContentfulId, res.locals.userContext);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});
