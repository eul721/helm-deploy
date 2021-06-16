import { Router } from 'express';
import { PathParam, Segment } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getAuthorizeForResourceMiddleware } from '../middleware/authorizeresource';
import { AdminRequirements } from '../models/auth/adminrequirements';
import { ResourceContext } from '../models/auth/resourcecontext';
import { ModifyAgreementRequest } from '../models/http/requests/modifyagreementrequest';
import { ModifyBranchRequest } from '../models/http/requests/modifybranchrequest';
import { ModifyTitleRequest } from '../models/http/requests/modifytitlerequest';
import { BranchService } from '../services/branch';
import { GameService } from '../services/game';
import { endpointServiceCallWrapper, toIntRequired } from '../utils/service';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {PATCH} /api/publisher/games/:gameId Modify a game
 * @apiName ModifyGame
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Modify a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.patch(
  `/${Segment.games}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Always),
  endpointServiceCallWrapper(async (req, res) => {
    const payload: ModifyTitleRequest = req.body as ModifyTitleRequest;
    return GameService.modifyGame(ResourceContext.get(res), payload);
  })
);

/**
 * @api {PATCH} /api/publisher/games/:gameId/branches/:branchId Modify a branch
 * @apiName ModifyGame
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Modify a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.patch(
  `/${Segment.games}/${Segment.branches}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Always),
  endpointServiceCallWrapper(async (req, res) => {
    const payload: ModifyBranchRequest = req.body as ModifyBranchRequest;
    return BranchService.setPassword(ResourceContext.get(res), payload.password);
  })
);

/**
 * @api {GET} /api/publisher/games/:gameId/branches Get branches
 * @apiName GetBranches
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title, includes private branches
 *
 * @apiParam (Query) {String} title game contentful id
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.get(
  `/${Segment.games}/branches`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.getBranchesPublisher(ResourceContext.get(res));
  })
);

/**
 * @api {GET} /api/publisher/games/:gameId/eulas Get Eula
 * @apiName GetEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Get eula assigned to a given game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.get(
  `/${Segment.games}/eulas`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.getEula(ResourceContext.get(res));
  })
);

/**
 * @api {POST} /api/publisher/games/:gameId/eulas Create Eula
 * @apiName CreateEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Create Eula
 *
 * @apiParam (Query) {String} url Url with fill EULA text
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.post(
  `/${Segment.games}/eulas`,
  getAuthorizeForResourceMiddleware('create', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.createEula(ResourceContext.get(res));
  })
);

/**
 * @api {Delete} /api/publisher/games/:gameId/eulas/:eulaId Remove Eula
 * @apiName RemoveEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Remove Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.delete(
  `/${Segment.games}/${Segment.eula}`,
  getAuthorizeForResourceMiddleware('delete', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper(async (req, res) => {
    const eulaId = toIntRequired(req.params[PathParam.eulaId]);
    return GameService.removeEula(ResourceContext.get(res), eulaId);
  })
);

/**
 * @api {Patch} /api/publisher/games/:gameId/eulas/:eulaId Modify Eula
 * @apiName ModifyEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Modify Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.patch(
  `/${Segment.games}/${Segment.eula}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper(async (req, res) => {
    const eulaId = toIntRequired(req.params[PathParam.eulaId]);
    const body = req.body as ModifyAgreementRequest;
    return GameService.updateEula(ResourceContext.get(res), eulaId, body);
  })
);
