import { Op, WhereOptions } from 'sequelize';
import { UserContext } from '../models/auth/usercontext';
import { RoleModel } from '../models/db/role';
import { UserModel } from '../models/db/user';
import {
  ResourcePermissionType,
  PermissionModel,
  DivisionPermissionType,
  PermissionAttributes,
} from '../models/db/permission';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { GroupModel } from '../models/db/group';
import { warn } from '../logger';
import { DivisionAttributes, DivisionModel } from '../models/db/division';
import { BuildAttributes } from '../models/db/build';
import { BranchAttributes } from '../models/db/branch';
import { GameAttributes, GameModel } from '../models/db/game';
import { UserDescription } from '../models/http/rbac/userdescription';

export enum AccessType {
  GameBinaries,
  GameMetadata,
  Public,
}

export class RbacService {
  /**
   * Checks whether the given user has specified division-wide permission,
   *
   * @param userContext information about the requester
   * @param permission queried permission
   * @param targetDivisionId id of the division the permission should apply to
   */
  public static async hasDivisionPermission(
    userContext: UserContext,
    permission: DivisionPermissionType,
    targetDivisionId: number
  ): Promise<ServiceResponse<boolean>> {
    try {
      const user = await userContext.fetchStudioUserModel();
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
      return { code: HttpCode.OK, payload: result.count > 0 };
    } catch (err) {
      warn('Encountered error, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR, payload: false };
    }
  }

  /**
   * Checks whether the given user has specified resource-access permission for a given game,
   *
   * @param userContext information about the requester
   * @param gameFilter description/filter for the game the permissions are to apply to, this can be any unique id field
   * @param permission queried permission
   */
  public static async hasResourcePermission(
    userContext: UserContext,
    gameFilter: WhereOptions<GameModel>,
    permission: ResourcePermissionType
  ): Promise<ServiceResponse<boolean>> {
    return RbacService.hasRoleWithAllResourcePermission(userContext, gameFilter, [permission]);
  }

  /**
   * Checks whether the given user has specified resource-access permissions for a given game, note that this requires permissions to be on a single role, to avoid unintentional mixing of permissions
   * For example a role could allow updating live release, and another could allow creating new non-live resources but the person with both those shouldn't be allowed creating live releases
   *
   * @param userContext information about the requester
   * @param gameFilter description/filter for the game the permissions are to apply to, this can be any unique id field
   * @param permissions array of queries permissions
   */
  public static async hasRoleWithAllResourcePermission(
    userContext: UserContext,
    gameFilter: WhereOptions<GameModel>,
    permissions: ResourcePermissionType[]
  ): Promise<ServiceResponse<boolean>> {
    if (permissions.length === 0) {
      return { code: HttpCode.BAD_REQUEST };
    }

    try {
      const user = await userContext.fetchStudioUserModel();
      const permissionFilter: WhereOptions<PermissionModel> = { id: { [Op.in]: permissions } };
      const userFilter: WhereOptions<UserModel> = { id: user?.id };

      const result = await GroupModel.findAll({
        include: [
          { association: GroupModel.associations.assignedUsers, where: userFilter, required: true },
          {
            association: GroupModel.associations.assignedRoles,
            include: [
              { association: RoleModel.associations.assignedPermissions, where: permissionFilter, required: true },
              { association: RoleModel.associations.assignedGames, where: gameFilter, required: true },
            ],
            required: true,
          },
        ],
      });

      const someRoleHasAllRequiredPermissions = result.some(group =>
        group.assignedRoles?.some(role => role.assignedPermissions?.length === permissions.length)
      );

      return { code: HttpCode.OK, payload: someRoleHasAllRequiredPermissions };
    } catch (err) {
      warn('Encountered error, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR, payload: false };
    }
  }

  /**
   * TODO not sure belongs in this service or elsewhere, maybe title/game one?
   * TODO implement
   *
   * @param target description of the affected resource
   */
  public static async affectsLiveRelease(target: {
    gameDesc: Partial<GameAttributes>;
    branchDesc?: Partial<BranchAttributes>;
    buildDesc?: Partial<BuildAttributes>;
  }) {
    // TODO this has to come after contentful is replaced
    return !!target;
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
}
