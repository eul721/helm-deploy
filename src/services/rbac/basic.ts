import { Op, WhereOptions } from 'sequelize';
import { RoleModel } from '../../models/db/role';
import { UserAttributes, UserModel } from '../../models/db/user';
import {
  ResourcePermissionType,
  PermissionModel,
  DivisionPermissionType,
  PermissionAttributes,
} from '../../models/db/permission';
import { malformedRequestPastValidation, ServiceResponse } from '../../models/http/serviceresponse';
import { HttpCode } from '../../models/http/httpcode';
import { GroupModel } from '../../models/db/group';
import { DivisionAttributes, DivisionModel } from '../../models/db/division';
import { GameAttributes, GameUniqueIdentifier } from '../../models/db/game';
import { UserDescription } from '../../models/http/rbac/userdescription';
import { AuthenticateContext } from '../../models/auth/authenticatecontext';

export enum AccessType {
  GameBinaries,
  GameMetadata,
  Public,
}

export class RbacService {
  /**
   * Checks whether the given user has specified division-wide permission,
   *
   * @param user information about the requester
   * @param permission queried permission
   * @param targetDivisionId id of the division the permission should apply to
   */
  public static async hasDivisionPermission(
    user: UserModel,
    permission: DivisionPermissionType,
    targetDivisionId: number
  ): Promise<ServiceResponse> {
    const permissionFilter: WhereOptions<PermissionModel> = { id: permission };
    const userFilter: WhereOptions<UserModel> = { id: user?.id };
    const divisionFilter: WhereOptions<DivisionModel> = { id: targetDivisionId };

    const result = await GroupModel.findAndCountAll({
      where: { ownerId: user?.ownerId },
      include: [
        { association: GroupModel.associations.assignedUsers, where: userFilter, required: true },
        {
          association: GroupModel.associations.assignedRoles,
          include: [{ association: RoleModel.associations.assignedPermissions, where: permissionFilter }],
          required: true,
        },
        {
          association: GroupModel.associations.owner,
          where: divisionFilter,
          required: true,
        },
      ],
    });
    return { code: result.count > 0 ? HttpCode.OK : HttpCode.FORBIDDEN };
  }

  /**
   * Checks whether the given user has specified resource-access permission for a given game,
   *
   * @param userId information about the requester
   * @param gameDesc unique game desciption
   * @param permission queried permission
   */
  public static async hasResourcePermission(
    userId: number,
    gameDesc: GameUniqueIdentifier,
    permission: ResourcePermissionType
  ): Promise<ServiceResponse> {
    return RbacService.hasRoleWithAllResourcePermission(userId, gameDesc, [permission]);
  }

  /**
   * Checks whether the given user has specified resource-access permissions for a given game, note that this requires permissions to be on a single role, to avoid unintentional mixing of permissions
   * For example a role could allow updating live release, and another could allow creating new non-live resources but the person with both those shouldn't be allowed creating live releases
   *
   * @param userId information about the requester
   * @param gameDesc unique game desciption
   * @param permissions array of queries permissions
   */
  public static async hasRoleWithAllResourcePermission(
    userId: number,
    gameDesc: GameUniqueIdentifier,
    permissions: ResourcePermissionType[]
  ): Promise<ServiceResponse> {
    if (permissions.length === 0) {
      return { code: HttpCode.BAD_REQUEST };
    }

    const permissionFilter: WhereOptions<PermissionModel> = { id: { [Op.in]: permissions } };
    const userFilter: WhereOptions<UserModel> = { id: userId };

    const result = await GroupModel.findAll({
      include: [
        { association: GroupModel.associations.assignedUsers, where: userFilter, required: true },
        {
          association: GroupModel.associations.assignedRoles,
          include: [
            { association: RoleModel.associations.assignedPermissions, where: permissionFilter, required: true },
            { association: RoleModel.associations.assignedGames, where: gameDesc, required: true },
          ],
          required: true,
        },
      ],
    });

    const someRoleHasAllRequiredPermissions = result.some(group =>
      group.assignedRoles?.some(role => role.assignedPermissions?.length === permissions.length)
    );

    return { code: someRoleHasAllRequiredPermissions ? HttpCode.OK : HttpCode.FORBIDDEN };
  }

  /**
   * Assembles http models for a given user
   *
   * @param user model of the target user
   */
  public static async assembleUserInfoFromModel(user: UserModel): Promise<ServiceResponse<UserDescription>> {
    const neededGameAttributes: (keyof GameAttributes)[] = ['contentfulId'];
    const neededPermissionAttributes: (keyof PermissionAttributes)[] = ['id'];
    const neededDivisionAttributes: (keyof DivisionAttributes)[] = ['name'];
    await user.reload({
      include: [
        {
          association: UserModel.associations.groupsWithUser,
          include: [
            {
              association: GroupModel.associations.assignedRoles,
              include: [
                { association: RoleModel.associations.assignedGames, attributes: neededGameAttributes },
                { association: RoleModel.associations.assignedPermissions, attributes: neededPermissionAttributes },
              ],
            },
            { association: GroupModel.associations.owner, attributes: neededDivisionAttributes },
          ],
        },
      ],
    });
    return { code: HttpCode.OK, payload: user.toHttpModel() };
  }

  /**
   * Assembles http models for a user with given external id
   *
   * @param externalId id of the target user
   */
  public static async assembleUserInfo(externalId: string): Promise<ServiceResponse<UserDescription>> {
    const user = await UserModel.findOne({ where: { externalId } });
    if (!user) {
      return { code: HttpCode.NOT_FOUND };
    }
    return RbacService.assembleUserInfoFromModel(user);
  }

  /**
   * Gets all users in a division
   *
   * @param authenticateContext request context
   */
  public static async getUsersInOwnDivision(
    authenticateContext: AuthenticateContext
  ): Promise<ServiceResponse<UserDescription[]>> {
    const externalIdAttrib: keyof UserAttributes = 'externalId';
    const caller = await authenticateContext.fetchStudioUserModel();
    if (!caller) {
      return malformedRequestPastValidation();
    }
    const users = await UserModel.findAll({
      where: { ownerId: caller.ownerId },
      attributes: [externalIdAttrib],
    });

    return { code: HttpCode.OK, payload: users.map(item => item.toHttpModel()) };
  }
}
