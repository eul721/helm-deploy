import { Router } from 'express';
import { PathParam, Segment } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getAuthorizeForResourceMiddleware } from '../middleware/authorizeresource';
import { AdminRequirements } from '../models/auth/adminrequirements';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { ResourceContext } from '../models/auth/resourcecontext';
import { BranchService } from '../services/branch';
import { GameService } from '../services/game';
import { getQueryParamValue } from '../utils/http';
import { endpointServiceCallWrapper } from '../utils/service';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/publisher/games Get Games
 * @apiName GetGames
 * @apiGroup Publisher
 * @apiDescription Get a list of games the authenticated user is allowed to see
 * @apiVersion 0.0.1
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 *
 * @apiUse PublisherGameModelsArray
 */
publishApiRouter.get(
  `/${Segment.games}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper(async (_req, res) => {
    const publisherContext = AuthenticateContext.get(res);
    return GameService.getGamesPublisher(publisherContext);
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
  `/${Segment.gameById}/branches`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.getBranchesPublisher(ResourceContext.get(res));
  })
);

/**
 * @api {POST} /api/publisher/games/:gameId/contentful/:contentfulId Set contentfulId on a game
 * @apiName SetContentfulId
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Set contentful id for a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.post(
  `/${Segment.gameById}/${Segment.contentful}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.Always),
  endpointServiceCallWrapper(async (req, res) => {
    const contentfulId = req.params[PathParam.contentfulId];
    return GameService.setContentfulId(ResourceContext.get(res), contentfulId);
  })
);

/**
 * @api {POST} /api/publisher/games/:gameId/branches/:branchId Set main branch of a game
 * @apiName SetContentfulId
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Set contentful id for a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.post(
  `/${Segment.gameById}/${Segment.branches}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.Always),
  endpointServiceCallWrapper(async (_req, res) => {
    return GameService.setMainBranch(ResourceContext.get(res));
  })
);

/**
 * @api {PATCH} /api/publisher/games/:gameId/branches/:branchId Update a branch
 * @apiName UpdateBranch
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Update a branch
 *
 * @apiParam (Query) {String} password Password to set on the branch, can be empty to remove it
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.patch(
  `/${Segment.gameById}/${Segment.branches}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.Always),
  endpointServiceCallWrapper(async (req, res) => {
    const password = getQueryParamValue(req, 'password');
    return BranchService.setPassword(ResourceContext.get(res), password);
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
  `/${Segment.gameById}/eulas`,
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
  `/${Segment.gameById}/eulas`,
  getAuthorizeForResourceMiddleware('create', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper(async (req, res) => {
    const url = getQueryParamValue(req, 'url');
    return GameService.createEula(ResourceContext.get(res), url);
  })
);

/**
 * @api {DELETE} /api/publisher/games/:gameId/eulas/:eulaId Remove Eula
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
  `/${Segment.gameById}/${Segment.eula}/`,
  getAuthorizeForResourceMiddleware('delete', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper(async (req, res) => {
    const eulaId = Number.parseInt(req.params[PathParam.eulaId], 10);
    return GameService.removeEula(ResourceContext.get(res), eulaId);
  })
);
