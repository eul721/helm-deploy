import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { UserContext } from '../models/auth/usercontext';

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
  const userContext = res.locals.userContext as UserContext;
  const response = await userContext.getOwnedTitles();
  res.status(response.code).json(response.payload);
});
