import { Router } from 'express';
import { PathParam, Segment } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getAuthorizeForResourceMiddleware } from '../middleware/authorizeresource';
import { AdminRequirements } from '../models/auth/adminrequirements';
import { ResourceContext } from '../models/auth/resourcecontext';
import { AgreementDescription, AgreementResponse } from '../models/http/public/agreementdescription';
import { PublisherBranchDescription } from '../models/http/rbac/publisherbranchdescription';
import { PublisherBuildResponse } from '../models/http/rbac/publisherbuilddescription';
import { PublisherGameDescription } from '../models/http/rbac/publishergamedescription';
import { ModifyAgreementRequest } from '../models/http/requests/modifyagreementrequest';
import { ModifyBranchRequest } from '../models/http/requests/modifybranchrequest';
import { ModifyBuildRequest } from '../models/http/requests/modifybuildrequest';
import { ModifyTitleRequest } from '../models/http/requests/modifytitlerequest';
import { ServiceResponse } from '../models/http/serviceresponse';
import { BranchService } from '../services/branch';
import { BuildService } from '../services/build';
import { GameService } from '../services/game';
import { endpointServiceCallWrapper, toIntRequired } from '../utils/service';

export const bdcCliApiRouter = Router();

bdcCliApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {PATCH} /api/publisher/bdccli/games/:bdsGameId Modify a game
 * @apiName ModifyGame
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse PublisherGameDescription
 */
bdcCliApiRouter.patch(
  `/${Segment.gameByBdsId}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Always),
  endpointServiceCallWrapper<ServiceResponse<PublisherGameDescription>>(async (req, res) => {
    const payload: ModifyTitleRequest = req.body as ModifyTitleRequest;
    return GameService.modifyGame(ResourceContext.get(res), payload);
  })
);

/**
 * @api {PATCH} /api/publisher/bdccli/games/:bdsGameId/branches/:bdsBranchId Modify a branch
 * @apiName ModifyGame
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse PublisherBranchDescription
 */
bdcCliApiRouter.patch(
  `/${Segment.gameByBdsId}/${Segment.branchByBdsId}`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Always),
  endpointServiceCallWrapper<ServiceResponse<PublisherBranchDescription>>(async (req, res) => {
    const payload: ModifyBranchRequest = req.body as ModifyBranchRequest;
    return BranchService.modifyBranch(ResourceContext.get(res), payload);
  })
);

/**
 * @api {GET} /api/publisher/bdccli/games/:bdsGameId/eulas Get Eula
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
bdcCliApiRouter.get(
  `/${Segment.gameByBdsId}/eulas`,
  getAuthorizeForResourceMiddleware('read', AdminRequirements.Never),
  endpointServiceCallWrapper<ServiceResponse<AgreementResponse>>(async (_req, res) => {
    return GameService.getEula(ResourceContext.get(res));
  })
);

/**
 * @api {POST} /api/publisher/bdccli/games/:bdsGameId/eulas Create Eula
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
 * @apiUse AgreementDescription
 */
bdcCliApiRouter.post(
  `/${Segment.gameByBdsId}/eulas`,
  getAuthorizeForResourceMiddleware('create', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse<AgreementDescription>>(async (_req, res) => {
    return GameService.createEula(ResourceContext.get(res));
  })
);

/**
 * @api {DELETE} /api/publisher/bdccli/games/:bdsGameId/eulas/:eulaId Remove Eula
 * @apiName RemoveEula
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Remove Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 */
bdcCliApiRouter.delete(
  `/${Segment.gameByBdsId}/${Segment.eula}`,
  getAuthorizeForResourceMiddleware('delete', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse>(async (req, res) => {
    const eulaId = toIntRequired(req.params[PathParam.eulaId]);
    return GameService.removeEula(ResourceContext.get(res), eulaId);
  })
);

/**
 * @api {Patch} /api/publisher/bdccli/games/:bdsGameId/eulas/:eulaId Modify Eula
 * @apiName ModifyEula
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse AgreementResponse
 */
bdcCliApiRouter.patch(
  `/${Segment.gameByBdsId}/${Segment.eula}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse<AgreementResponse>>(async (req, res) => {
    const eulaId = toIntRequired(req.params[PathParam.eulaId]);
    const body = req.body as ModifyAgreementRequest;
    return GameService.updateEula(ResourceContext.get(res), eulaId, body);
  })
);

/**
 * @api {Patch} /api/publisher/games/:bdsGameId/builds/:bdsBuildId Modify build
 * @apiName ModifyName
 * @apiGroup Publisher
 * @apiVersion 0.0.1
 * @apiDescription Modify Name
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeResourceAccessMiddleware
 *
 * @apiUse PublisherBuildResponse
 */
bdcCliApiRouter.patch(
  `/${Segment.gameByBdsId}/${Segment.buildByBdsId}`,
  getAuthorizeForResourceMiddleware('update', AdminRequirements.ReleasedGame),
  endpointServiceCallWrapper<ServiceResponse<PublisherBuildResponse>>(async (req, res) => {
    const body = req.body as ModifyBuildRequest;
    return BuildService.modifyBuild(ResourceContext.get(res), body);
  })
);
