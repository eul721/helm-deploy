import { Segment } from '../../configuration/httpconfig';
import { getAuthorizeForRbacMiddleware } from '../../middleware/authorizeforrbac';
import { RbacContext } from '../../models/auth/rbaccontext';
import { RbacResource } from '../../models/auth/rbacresource';
import { RbacGroupsService } from '../../services/rbac/groups';
import { getQueryParamValue } from '../../utils/http';
import { endpointServiceCallWrapper } from '../../utils/service';
import { rbacApiRouter } from './basic';

/**
 * @api {POST} /api/division/:divisionId/groups Create group
 * @apiName CreateGroups
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Create group
 *
 * @apiParam (Query) {String} groupName Name of the group to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse GroupDescription
 */
rbacApiRouter.post(
  `/${Segment.division}/groups`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  endpointServiceCallWrapper(async (req, res) => {
    const name = getQueryParamValue(req, 'groupName');
    return RbacGroupsService.createGroup(RbacContext.get(res), name);
  })
);

/**
 * @api {DELETE} /api/division/:divisionId/groups/:groupId Remove group
 * @apiName RemoveGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Remove group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.division}/${Segment.groups}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION, {
    resource: RbacResource.GROUP,
    allowDifferentOwner: true,
  }),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.removeGroup(RbacContext.get(res));
  })
);

/**
 * @api {GET} /api/division/:divisionId/users Get groups
 * @apiName GetGroups
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Get groups
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse GroupDescriptionArray
 */
rbacApiRouter.get(
  `/${Segment.division}/groups`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.getGroups(RbacContext.get(res));
  })
);

/**
 * @api {POST} /api/groups/:groupId/users/:userId Add user to group
 * @apiName AddUserToGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Add user to group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse GroupDescription
 */
rbacApiRouter.post(
  `/${Segment.groups}/${Segment.users}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.USER,
    allowDifferentOwner: true,
  }),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.addUserToGroup(RbacContext.get(res));
  })
);

/**
 * @api {DELETE} /api/groups/:groupId/users/:userId Remove user from group
 * @apiName RemoveUserFromGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Remove user from group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse GroupDescription
 */
rbacApiRouter.delete(
  `/${Segment.groups}/${Segment.users}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.USER,
    allowDifferentOwner: true,
  }),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.removeUserFromGroup(RbacContext.get(res));
  })
);

/**
 * @api {GET} /api/groups/:groupId/users Get users in group
 * @apiName GetUsersInGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Get users in group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse UserDescriptionArray
 */
rbacApiRouter.get(
  `/${Segment.groups}/users`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.getUsersInGroup(RbacContext.get(res));
  })
);

/**
 * @api {POST} /api/groups/:groupId/roles/:roleId Add role to group
 * @apiName AddRoleToGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Add role to group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse GroupDescription
 */
rbacApiRouter.post(
  `/${Segment.groups}/${Segment.roles}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.ROLE,
    allowDifferentOwner: false,
  }),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.addRoleToGroup(RbacContext.get(res));
  })
);

/**
 * @api {DELETE} /api/groups/:groupId/roles/:roleId Remove role from group
 * @apiName RemoveRoleFromGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Remove role from group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse GroupDescription
 */
rbacApiRouter.delete(
  `/${Segment.groups}/${Segment.roles}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.ROLE,
    allowDifferentOwner: false,
  }),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.removeRoleFromGroup(RbacContext.get(res));
  })
);

/**
 * @api {GET} /api/division/:divisionId/users Get roles in group
 * @apiName GetRolesInGroup
 * @apiGroup RbacGroups
 * @apiVersion 0.0.1
 * @apiDescription Get roles in group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 *
 * @apiUse RoleDescriptionArray
 */
rbacApiRouter.get(
  `/${Segment.groups}/roles`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP),
  endpointServiceCallWrapper(async (_req, res) => {
    return RbacGroupsService.getRolesInGroup(RbacContext.get(res));
  })
);
