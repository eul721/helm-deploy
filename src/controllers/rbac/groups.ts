import { Segment } from '../../configuration/httpconfig';
import { getAuthorizeForRbacMiddleware } from '../../middleware/authorizeforrbac';
import { RbacContext } from '../../models/auth/rbaccontext';
import { RbacResource } from '../../models/auth/rbacresource';
import { GroupModel } from '../../models/db/group';
import { HttpCode } from '../../models/http/httpcode';
import { getQueryParamValue, sendMessageResponse } from '../../utils/http';
import { rbacApiRouter } from './basic';

/**
 * @api {POST} /api/division/:divisionId/groups Create group
 * @apiName CreateGroups
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Create group
 *
 * @apiParam (Query) {String} groupName Name of the group to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.post(
  `/${Segment.division}/groups`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  async (req, res) => {
    const name = getQueryParamValue(req, 'groupName');
    if (!name) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing groupName query param');
      return;
    }

    const rbacContext = RbacContext.get(res);
    const division = await rbacContext.fetchDivisionModel();

    const existingGroup = await GroupModel.findOne({ where: { name, ownerId: division?.id } });
    if (existingGroup) {
      sendMessageResponse(res, HttpCode.CONFLICT, 'A group with this name already exists');
      return;
    }

    await division?.createGroupEntry({ name });
    sendMessageResponse(res);
  }
);

/**
 * @api {DELETE} /api/division/:divisionId/groups/:groupId Remove group
 * @apiName RemoveGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
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
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    await group?.destroy();
    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/division/:divisionId/users Get groups
 * @apiName GetGroups
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Get groups
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.division}/groups`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const division = await rbacContext.fetchDivisionModel();
    const groups = await division?.getGroups();
    res.status(HttpCode.OK).json(groups?.map(group => group.toHttpModel()));
  }
);

/**
 * @api {POST} /api/groups/:groupId/users/:userId Add user to group
 * @apiName AddUserToGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Add user to group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.post(
  `/${Segment.groups}/${Segment.users}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.USER,
    allowDifferentOwner: true,
  }),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    const user = await rbacContext.fetchUserModel();

    if (!user || !group) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    await group.addAssignedUser(user);
    sendMessageResponse(res);
  }
);

/**
 * @api {DELETE} /api/groups/:groupId/users/:userId Remove user from group
 * @apiName RemoveUserFromGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Remove user from group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.groups}/${Segment.users}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.USER,
    allowDifferentOwner: true,
  }),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    const user = await rbacContext.fetchUserModel();

    if (!user || !group) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    await group.removeAssignedUser(user);

    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/groups/:groupId/users Get users in group
 * @apiName GetUsersInGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Get users in group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.groups}/users`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    const users = await group?.getAssignedUsers();
    res.status(HttpCode.OK).json(users?.map(user => user.toHttpModel()) ?? []);
  }
);

/**
 * @api {POST} /api/groups/:groupId/roles/:roleId Add role to group
 * @apiName AddRoleToGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Add role to group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.post(
  `/${Segment.groups}/${Segment.roles}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.ROLE,
    allowDifferentOwner: false,
  }),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    const role = await rbacContext.fetchRoleModel();

    if (!role || !group) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    await group.addAssignedRole(role);

    sendMessageResponse(res);
  }
);

/**
 * @api {DELETE} /api/groups/:groupId/roles/:roleId Remove role from group
 * @apiName RemoveRoleFromGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Remove role from group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.groups}/${Segment.roles}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP, {
    resource: RbacResource.ROLE,
    allowDifferentOwner: false,
  }),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    const role = await rbacContext.fetchRoleModel();

    if (!role || !group) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    await group.removeAssignedRole(role);

    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/division/:divisionId/users Get roles in group
 * @apiName GetRolesInGroup
 * @apiGroup RbacGroups
 * @apiVersion  0.0.1
 * @apiDescription Get roles in group
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.groups}/roles`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.GROUP),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const group = await rbacContext.fetchGroupModel();
    const roles = await group?.getAssignedRoles();
    res.status(HttpCode.OK).json(roles?.map(role => role.toHttpModel()) ?? []);
  }
);
