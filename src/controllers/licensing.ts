import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { UserContext } from '../models/auth/usercontext';
import { sendServiceResponse } from '../utils/http';

export const licensingApiRouter = Router();

licensingApiRouter.use(getAuthenticateMiddleware(), getAuthorizePlayerMiddleware());

/**
 * @api {GET} /api/licensing Get licenses
 * @apiName GetLicenses
 * @apiGroup Licensing
 * @apiVersion  0.0.1
 * @apiDescription Get all licenses
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
licensingApiRouter.get('/', async (_req, res) => {
  const userContext = UserContext.get(res);
  const response = await userContext.fetchOwnedTitles();
  sendServiceResponse(response, res);
});
