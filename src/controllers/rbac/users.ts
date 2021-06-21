import { Segment } from '../../configuration/httpconfig';
import { getAuthorizeForRbacMiddleware } from '../../middleware/authorizeforrbac';
import { RbacContext } from '../../models/auth/rbaccontext';
import { RbacResource } from '../../models/auth/rbacresource';
import { AuthenticateContext } from '../../models/auth/authenticatecontext';
import { getQueryParamValue } from '../../utils/http';
import { rbacApiRouter } from './basic';
import { RbacUsersService } from '../../services/rbac/users';
import { endpointServiceCallWrapper } from '../../utils/service';

/**
 * @api {POST} /api/division/:divisionId/users Create user
 * @apiName CreateUser
 * @apiGroup RbacUsers
 * @apiVersion 0.0.1
 * @apiDescription Create a user
 *
 * @apiParam (Query) {String} dnaId DNA Identifier of the user to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse UserDescription
 */
rbacApiRouter.post(
  `/${Segment.division}/users`,
  getAuthorizeForRbacMiddleware('create-account', RbacResource.DIVISION),
  endpointServiceCallWrapper(async (req, res) => {
    const dnaId = getQueryParamValue(req, 'dnaId');
    return RbacUsersService.createUser(RbacContext.get(res), dnaId);
  })
);

/**
 * @api {GET} /api/division/:divisionId/users Get users
 * @apiName GetUsers
 * @apiGroup RbacUsers
 * @apiVersion 0.0.1
 * @apiDescription Get all users in a division, returns only basic information
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse UserDescriptionArray
 */
rbacApiRouter.get(
  `/${Segment.division}/users`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacUsersService.getUsers(RbacContext.get(res));
  })
);

/**
 * @api {DELETE} /api/users/:userId Remove user
 * @apiName RemoveUser
 * @apiGroup RbacUsers
 * @apiVersion 0.0.1
 * @apiDescription Remove user
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.users}`,
  getAuthorizeForRbacMiddleware('remove-account', RbacResource.USER),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacUsersService.removeUser(RbacContext.get(res), AuthenticateContext.get(res));
  })
);

/**
 * @api {GET} /api/users/:userId Get user
 * @apiName GetUser
 * @apiGroup RbacUsers
 * @apiVersion 0.0.1
 * @apiDescription Get user
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse UserDescription
 */
rbacApiRouter.get(
  `/${Segment.users}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.USER),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacUsersService.getUser(RbacContext.get(res));
  })
);
