import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { PlayerContext } from '../models/auth/playercontext';
import { LicensingService } from '../services/licensing';
import { endpointServiceCallWrapper } from '../utils/service';

export const licensingApiRouter = Router();

licensingApiRouter.use(getAuthenticateMiddleware());

/**
 * @api {GET} /api/licensing Get licenses
 * @apiName GetLicenses
 * @apiGroup Licensing
 * @apiVersion 0.0.1
 * @apiDescription Get all licenses
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 *
 * @apiSuccess (200) {String[]} - Array of contentful ids of permitted/owned games
 */
licensingApiRouter.get(
  '/',
  getAuthorizePlayerMiddleware(),
  endpointServiceCallWrapper(async (_req, res) => {
    return LicensingService.fetchLicenses(PlayerContext.get(res));
  })
);
