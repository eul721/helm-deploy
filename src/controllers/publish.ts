import { Router } from 'express';
import { PathParam, Segment } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getAuthorizeForResourceMiddleware } from '../middleware/authorizeresource';
import { getPagination, paginationMiddleware } from '../middleware/pagination';
import { AdminRequirements } from '../models/auth/adminrequirements';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { ResourceContext } from '../models/auth/resourcecontext';
import { AgreementResponse } from '../models/http/public/agreementdescription';
import { PublisherBranchResponse } from '../models/http/rbac/publisherbranchdescription';
import { PublisherGameResponse } from '../models/http/rbac/publishergamedescription';
import { ModifyAgreementRequest } from '../models/http/requests/modifyagreementrequest';
import { ModifyBranchRequest } from '../models/http/requests/modifybranchrequest';
import { ModifyTitleRequest } from '../models/http/requests/modifytitlerequest';
import { PaginatedServiceResponse, ServiceResponse } from '../models/http/serviceresponse';
import { BranchService } from '../services/branch';
import { GameService } from '../services/game';
import { endpointServiceCallWrapper, toIntRequired } from '../utils/service';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/** * @api {GET} /api/publisher/games Get Games
 * @apiName GetGames
 * @apiGroup Publisher
 * @apiDescription Get a list of games the authenticated user is allowed to see
 * @apiVersion 0.0.1
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 *
 * @apiUse PaginationRequest
 *
 * @apiUse PublisherGameResponse
 * @apiUse PageDataResponse
 */
publishApiRouter.get(
  `/${Segment.games}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  paginationMiddleware(),
  endpointServiceCallWrapper<PaginatedServiceResponse<PublisherGameResponse>>((_req, res) => {
    const publisherContext = AuthenticateContext.get(res);
    const paginationContext = getPagination(res);
    return GameService.getGamesPublisher(publisherContext, paginationContext);
  })
);

/**
 * @api {GET} /api/publisher/games/:gameId Get Game
 * @apiName GetGame
 * @apiGroup Publisher
 * @apiDescription Get a single game by ID
 * @apiVersion 0.0.1
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 *
 * @apiUse PublisherGameResponse
 */
publishApiRouter.get(
  `/${Segment.gameById}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper<ServiceResponse<PublisherGameResponse>>(async (_req, res) => {
    const publisherContext = AuthenticateContext.get(res);
    return GameService.getGamePublisher(ResourceContext.get(res), publisherContext);
  })
);

/**
 * @api {PATCH} /api/publisher/games/:gameId Modify a game
 * @apiName ModifyGame
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse PublisherGameResponse
 */
publishApiRouter.patch(
  `/${Segment.gameById}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Always),
  endpointServiceCallWrapper<ServiceResponse<PublisherGameResponse>>(async (req, res) => {
    const payload: ModifyTitleRequest = req.body as ModifyTitleRequest;
    return GameService.modifyGame(ResourceContext.get(res), payload);
  })
);

/**
 * @api {PATCH} /api/publisher/games/:gameId/branches/:branchId Modify a branch
 * @apiName ModifyGame
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse PublisherBranchResponse
 */
publishApiRouter.patch(
  `/${Segment.gameById}/${Segment.branches}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Always),
  endpointServiceCallWrapper<ServiceResponse<PublisherBranchResponse>>(async (req, res) => {
    const payload: ModifyBranchRequest = req.body as ModifyBranchRequest;
    return BranchService.setPassword(ResourceContext.get(res), payload.password);
  })
);

/**
 * @api {GET} /api/publisher/games/:gameId/branches Get branches
 * @apiName GetBranches
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Get branch list for a specified title, includes private branches
 *
 * @apiParam (Query) {String} title game contentful id
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse PublisherBranchResponse
 */
publishApiRouter.get(
  `/${Segment.gameById}/branches`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper<ServiceResponse<PublisherBranchResponse>>(async (_req, res) => {
    return GameService.getBranchesPublisher(ResourceContext.get(res));
  })
);

/**
 * @api {GET} /api/publisher/games/:gameId/eulas Get Eula
 * @apiName GetEula
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Get eula assigned to a given game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse AgreementResponse
 */
publishApiRouter.get(
  `/${Segment.gameById}/eulas`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper<ServiceResponse<AgreementResponse>>(async (_req, res) => {
    return GameService.getEula(ResourceContext.get(res));
  })
);

/**
 * @api {POST} /api/publisher/games/:gameId/eulas Create Eula
 * @apiName CreateEula
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Create Eula
 *
 * @apiParam (Query) {String} url Url with fill EULA text
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse AgreementResponse
 */
publishApiRouter.post(
  `/${Segment.gameById}/eulas`,
  getAuthorizeForResourceMiddleware('create', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse<AgreementResponse>>(async (_req, res) => {
    return GameService.createEula(ResourceContext.get(res));
  })
);

/**
 * @api {DELETE} /api/publisher/games/:gameId/eulas/:eulaId Remove Eula
 * @apiName RemoveEula
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Remove Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.delete(
  `/${Segment.gameById}/${Segment.eula}`,
  getAuthorizeForResourceMiddleware('delete', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse>(async (req, res) => {
    const eulaId = toIntRequired(req.params[PathParam.eulaId]);
    return GameService.removeEula(ResourceContext.get(res), eulaId);
  })
);

/**
 * @api {Patch} /api/publisher/games/:gameId/eulas/:eulaId Modify Eula
 * @apiName ModifyEula
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
publishApiRouter.patch(
  `/${Segment.gameById}/${Segment.eula}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse>(async (req, res) => {
    const eulaId = toIntRequired(req.params[PathParam.eulaId]);
    const body = req.body as ModifyAgreementRequest;
    return GameService.updateEula(ResourceContext.get(res), eulaId, body);
  })
);
