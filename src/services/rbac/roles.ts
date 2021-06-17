import { RbacContext } from '../../models/auth/rbaccontext';
import { RoleModel } from '../../models/db/role';
import { HttpCode } from '../../models/http/httpcode';
import { GameDescription } from '../../models/http/rbac/gamedescription';
import { PermissionDescription } from '../../models/http/rbac/permissiondescription';
import { RoleDescription } from '../../models/http/rbac/roledescription';
import { malformedRequestPastValidation, ServiceResponse } from '../../models/http/serviceresponse';

export class RbacRolesService {
  /**
   * Create role
   *
   * @param rbacContext request context
   * @param roleName name of the role to create
   */
  public static async createRole(
    rbacContext: RbacContext,
    roleName?: string
  ): Promise<ServiceResponse<RoleDescription>> {
    if (!roleName) {
      return { code: HttpCode.BAD_REQUEST, message: 'Missing roleName query param' };
    }

    const division = await rbacContext.fetchDivisionModel();
    if (!division) {
      return malformedRequestPastValidation();
    }

    const existingRole = await RoleModel.findOne({ where: { name: roleName, ownerId: division?.id } });
    if (existingRole) {
      return { code: HttpCode.CONFLICT, message: 'A role with this name already exists' };
    }

    const role = await division?.createRoleEntry({ name: roleName });
    return { code: HttpCode.CREATED, payload: role.toPublisherHttpModel() };
  }

  /**
   * Get roles
   *
   * @param rbacContext request context
   */
  public static async getRoles(rbacContext: RbacContext): Promise<ServiceResponse<RoleDescription[]>> {
    const division = await rbacContext.fetchDivisionModel();
    if (!division) {
      return malformedRequestPastValidation();
    }

    const roles = await division.getRoles();
    return { code: HttpCode.OK, payload: roles.map(role => role.toPublisherHttpModel()) };
  }

  /**
   * Add permission to role
   *
   * @param rbacContext request context
   */
  public static async addPermissionToRole(rbacContext: RbacContext): Promise<ServiceResponse> {
    const role = await rbacContext.fetchRoleModel();
    if (!role) {
      return malformedRequestPastValidation();
    }

    const permission = await rbacContext.fetchPermissionModel();
    if (!permission) {
      return { code: HttpCode.BAD_REQUEST, message: `Requested permission doesn't exist: ${rbacContext.permission}` };
    }

    await role.addAssignedPermission(permission);
    return { code: HttpCode.OK };
  }

  /**
   * Remove permission from role
   *
   * @param rbacContext request context
   * @param name name of the role to create
   */
  public static async removePermissionFromRole(rbacContext: RbacContext): Promise<ServiceResponse> {
    const role = await rbacContext.fetchRoleModel();
    if (!role) {
      return malformedRequestPastValidation();
    }

    const permission = await rbacContext.fetchPermissionModel();
    if (!permission) {
      return { code: HttpCode.BAD_REQUEST, message: `Requested permission doesn't exist: ${rbacContext.permission}` };
    }

    await role.removeAssignedPermission(permission);

    return { code: HttpCode.OK };
  }

  /**
   * Gets permissions in a role
   *
   * @param rbacContext request context
   */
  public static async getPermissionsInRole(
    rbacContext: RbacContext
  ): Promise<ServiceResponse<PermissionDescription[]>> {
    const role = await rbacContext.fetchRoleModel();
    const permissions = await role?.getAssignedPermissions();
    if (!role || !permissions) {
      return malformedRequestPastValidation();
    }
    return { code: HttpCode.OK, payload: permissions.map(item => item.toHttpModel()) };
  }

  /**
   * Add game to role
   *
   * @param rbacContext request context
   */
  public static async addGameToRole(rbacContext: RbacContext): Promise<ServiceResponse<RoleDescription>> {
    const role = await rbacContext.fetchRoleModel();
    const game = await rbacContext.fetchGameModel();
    if (!role || !game) {
      return malformedRequestPastValidation();
    }

    await role.addAssignedGame(game);
    return { code: HttpCode.OK };
  }

  /**
   * Remove game from role
   *
   * @param rbacContext request context
   */
  public static async removeGameFromRole(rbacContext: RbacContext): Promise<ServiceResponse<RoleDescription>> {
    const role = await rbacContext.fetchRoleModel();
    const game = await rbacContext.fetchGameModel();
    if (!role || !game) {
      return malformedRequestPastValidation();
    }

    await role.removeAssignedGame(game);
    return { code: HttpCode.OK };
  }

  /**
   * Get games in a role
   *
   * @param rbacContext request context
   */
  public static async getGamesInRole(rbacContext: RbacContext): Promise<ServiceResponse<GameDescription[]>> {
    const role = await rbacContext.fetchRoleModel();
    const games = await role?.getAssignedGames();
    if (!role || !games) {
      return malformedRequestPastValidation();
    }
    return { code: HttpCode.OK, payload: games.map(item => item.toPublisherHttpModel()) };
  }
}
