import { Router } from 'express';
import { getAuthenticateMiddleware } from '../../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../../middleware/authorizepublisher';
import { AuthenticateContext } from '../../models/auth/authenticatecontext';
import { UserResponse } from '../../models/http/rbac/userdescription';
import { ServiceResponse } from '../../models/http/serviceresponse';
import { RbacService } from '../../services/rbac/basic';
import { endpointServiceCallWrapper } from '../../utils/service';

export const rbacApiRouter = Router();

rbacApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/rbac/about Get user information
 * @apiName GetUserInformation
 * @apiGroup User
 * @apiVersion 0.0.1
 * @apiDescription Get all rbac information about current user
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 *
 * @apiUse UserResponse
 */
rbacApiRouter.get(
  '/about',
  endpointServiceCallWrapper<ServiceResponse<UserResponse>>(async (_req, res) => {
    const context = AuthenticateContext.get(res);
    const callerId = (await context.fetchStudioUserModel())?.externalId ?? '';
    return RbacService.assembleUserInfo(callerId);
  })
);

/**
 * @api {GET} /api/rbac/users List users
 * @apiName ListUsers
 * @apiGroup User
 * @apiVersion 0.0.1
 * @apiDescription Get list of users in callers own division
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 *
 * @apiUse UserResponse
 */
rbacApiRouter.get(
  '/users',
  endpointServiceCallWrapper<ServiceResponse<UserResponse>>(async (_req, res) => {
    return RbacService.getUsersInOwnDivision(AuthenticateContext.get(res));
  })
);
