import { Segment } from '../../configuration/httpconfig';
import { getAuthorizeForRbacMiddleware } from '../../middleware/authorizeforrbac';
import { RbacContext } from '../../models/auth/rbaccontext';
import { RbacResource } from '../../models/auth/rbacresource';
import { RoleModel } from '../../models/db/role';
import { HttpCode } from '../../models/http/httpcode';
import { getQueryParamValue, sendMessageResponse } from '../../utils/http';
import { rbacApiRouter } from './basic';

/**
 * @api {POST} /api/division/:divisionId/users Create role
 * @apiName CreateRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Get roles
 *
 * @apiParam (Query) {String} roleName Name of the group to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.division}/roles`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  async (req, res) => {
    const name = getQueryParamValue(req, 'roleName');
    if (!name) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing roleName query param');
      return;
    }

    const rbacContext = RbacContext.get(res);
    const division = await rbacContext.fetchDivisionModel();

    const existingRole = await RoleModel.findOne({ where: { name, ownerId: division?.id } });
    if (existingRole) {
      sendMessageResponse(res, HttpCode.CONFLICT, 'A role with this name already exists');
      return;
    }

    await division?.createRoleEntry({ name });
    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/division/:divisionId/roles Get roles
 * @apiName GetRoles
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Get roles
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.division}/roles`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const division = await rbacContext.fetchDivisionModel();
    const roles = await division?.getRoles();
    res.status(HttpCode.OK).json(roles?.map(role => role.toHttpModel()) ?? []);
  }
);

/**
 * @api {POST} /api/roles/:roleId/permissions/:permissionId Add permission to role
 * @apiName AddPermissionToRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Add permission to role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.post(
  `/${Segment.roles}/${Segment.permissions}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const role = await rbacContext.fetchRoleModel();
    const permission = await rbacContext.fetchPermissionModel();
    if (!permission) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, `Requested permission doesn't exist: ${rbacContext.permission}`);
      return;
    }

    await role?.addAssignedPermission(permission);
    sendMessageResponse(res);
  }
);

/**
 * @api {DELETE} /api/roles/:roleId/permissions/:permissionId Remove permission from role
 * @apiName RemovePermissionFromRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Remove permission from role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.roles}/${Segment.permissions}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const role = await rbacContext.fetchRoleModel();
    const permission = await rbacContext.fetchPermissionModel();

    if (!permission) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, `Requested permission doesn't exist: ${rbacContext.permission}`);
      return;
    }

    await role?.removeAssignedPermission(permission);

    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/roles/:roleId/permissions Get permissions in role
 * @apiName GetPermissionsInRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Get permissions in role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.roles}/permissions`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const role = await rbacContext.fetchRoleModel();
    const permissions = await role?.getAssignedPermissions();

    res.status(HttpCode.OK).json(permissions?.map(permission => permission.toHttpModel()) ?? []);
  }
);

/**
 * @api {POST} /api/roles/:roleId/games/:gameId Add game to role
 * @apiName AddGameToRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Add game to role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.post(
  `/${Segment.roles}/${Segment.games}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE, {
    resource: RbacResource.GAME,
    allowDifferentOwner: false,
  }),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const role = await rbacContext.fetchRoleModel();
    const game = await rbacContext.fetchGameModel();

    if (!role || !game) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    await role.addAssignedGame(game);
    sendMessageResponse(res);
  }
);

/**
 * @api {DELETE} /api/roles/:roleId/games/:gameId Remove game from role
 * @apiName RemoveGameFromRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Remove game from role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.roles}/${Segment.games}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE, {
    resource: RbacResource.GAME,
    allowDifferentOwner: false,
  }),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const role = await rbacContext.fetchRoleModel();
    const game = await rbacContext.fetchGameModel();

    if (!role || !game) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    role.removeAssignedGame(game);
    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/roles/:roleId/games Get games in role
 * @apiName GetGamesInRole
 * @apiGroup RbacRoles
 * @apiVersion  0.0.1
 * @apiDescription Get games in role
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.roles}/games`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.ROLE),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const role = await rbacContext.fetchRoleModel();
    const games = await role?.getAssignedGames();
    res.status(HttpCode.OK).json(games?.map(game => game.toHttpModel()) ?? []);
  }
);
