import { Segment } from '../../configuration/httpconfig';
import { getAuthorizeForRbacMiddleware } from '../../middleware/authorizeforrbac';
import { RbacContext } from '../../models/auth/rbaccontext';
import { RbacResource } from '../../models/auth/rbacresource';
import { PermissionResponse } from '../../models/http/rbac/permissiondescription';
import { PublisherGameResponse } from '../../models/http/rbac/publishergamedescription';
import { RoleDescription, RoleResponse } from '../../models/http/rbac/roledescription';
import { ServiceResponse } from '../../models/http/serviceresponse';
import { RbacRolesService } from '../../services/rbac/roles';
import { endpointServiceCallWrapper } from '../../utils/service';
import { rbacApiRouter } from './basic';

/**
 * @api {POST} /api/division/:divisionId/users Create role
 * @apiName CreateRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Get roles
 *
 * @apiParam (Query) {String} roleName Name of the group to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleDescription
 */
rbacApiRouter.post(
  `/${Segment.division}/roles`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  endpointServiceCallWrapper<ServiceResponse<RoleDescription>>(async (_req, res) => {
    return RbacRolesService.createRole(RbacContext.get(res));
  })
);

/**
 * @api {GET} /api/division/:divisionId/roles Get roles
 * @apiName GetRoles
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Get roles
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleResponse
 */
rbacApiRouter.get(
  `/${Segment.division}/roles`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  endpointServiceCallWrapper<ServiceResponse<RoleResponse>>(async (_req, res) => {
    return RbacRolesService.getRoles(RbacContext.get(res));
  })
);

/**
 * @api {POST} /api/roles/:roleId/permissions/:permissionId Add permission to role
 * @apiName AddPermissionToRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Add permission to role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleDescription
 */
rbacApiRouter.post(
  `/${Segment.roles}/${Segment.permissions}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  endpointServiceCallWrapper<ServiceResponse<RoleDescription>>(async (_req, res) => {
    return RbacRolesService.addPermissionToRole(RbacContext.get(res));
  })
);

/**
 * @api {DELETE} /api/roles/:roleId/permissions/:permissionId Remove permission from role
 * @apiName RemovePermissionFromRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Remove permission from role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleDescription
 */
rbacApiRouter.delete(
  `/${Segment.roles}/${Segment.permissions}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  endpointServiceCallWrapper<ServiceResponse<RoleDescription>>(async (_req, res) => {
    return RbacRolesService.removePermissionFromRole(RbacContext.get(res));
  })
);

/**
 * @api {GET} /api/roles/:roleId/permissions Get permissions in role
 * @apiName GetPermissionsInRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Get permissions in role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse PermissionResponse
 */
rbacApiRouter.get(
  `/${Segment.roles}/permissions`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  endpointServiceCallWrapper<ServiceResponse<PermissionResponse>>(async (_req, res) => {
    return RbacRolesService.getPermissionsInRole(RbacContext.get(res));
  })
);

/**
 * @api {POST} /api/roles/:roleId/games/:gameId Add game to role
 * @apiName AddGameToRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Add game to role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleDescription
 */
rbacApiRouter.post(
  `/${Segment.roles}/${Segment.gameById}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE, {
    resource: RbacResource.GAME,
    allowDifferentOwner: false,
  }),
  endpointServiceCallWrapper<ServiceResponse<RoleDescription>>(async (_req, res) => {
    return RbacRolesService.addGameToRole(RbacContext.get(res));
  })
);

/**
 * @api {DELETE} /api/roles/:roleId/games/:gameId Remove game from role
 * @apiName RemoveGameFromRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Remove game from role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleDescription
 */
rbacApiRouter.delete(
  `/${Segment.roles}/${Segment.gameById}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE, {
    resource: RbacResource.GAME,
    allowDifferentOwner: false,
  }),
  endpointServiceCallWrapper<ServiceResponse<RoleDescription>>(async (_req, res) => {
    return RbacRolesService.removeGameFromRole(RbacContext.get(res));
  })
);

/**
 * @api {GET} /api/roles/:roleId/games Get games in role
 * @apiName GetGamesInRole
 * @apiGroup RbacRoles
 * @apiVersion 0.0.1
 * @apiDescription Get games in role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse PublisherGameResponse
 */
rbacApiRouter.get(
  `/${Segment.roles}/games`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  endpointServiceCallWrapper<ServiceResponse<PublisherGameResponse>>(async (_req, res) => {
    return RbacRolesService.getGamesInRole(RbacContext.get(res));
  })
);
