import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { Response } from 'express';
import { DivisionModel } from '../db/division';
import { GameModel } from '../db/game';
import { GroupModel } from '../db/group';
import { PermissionModel } from '../db/permission';
import { RoleModel } from '../db/role';
import { UserModel } from '../db/user';

/**
 * Data set on a request context (res.locals.rbacContext) that contains information about the rbac request
 * This information is generally created by rbac middleware and used by the controllers/services
 */
export class RbacContext {
  constructor(
    divisionId: number,
    groupId: number,
    roleId: number,
    userId: number,
    gameId?: string,
    permission?: string
  ) {
    this.divisionId = Number.isNaN(divisionId) ? undefined : divisionId;
    this.groupId = Number.isNaN(groupId) ? undefined : groupId;
    this.roleId = Number.isNaN(roleId) ? undefined : roleId;
    this.userId = Number.isNaN(userId) ? undefined : userId;
    this.gameId = gameId;
    this.permission = permission;
  }

  public static get(res: Response): RbacContext {
    return res.locals.rbacContext as RbacContext;
  }

  public async fetchDivisionModel(): Promise<Maybe<DivisionModel>> {
    if (this.division) {
      return this.division;
    }

    if (this.divisionId) {
      this.division = (await DivisionModel.findOne({ where: { id: this.divisionId } })) ?? undefined;
    }
    return this.division;
  }

  public async fetchGroupModel(): Promise<Maybe<GroupModel>> {
    if (this.group) {
      return this.group;
    }

    if (this.groupId) {
      this.group = (await GroupModel.findOne({ where: { id: this.groupId } })) ?? undefined;
    }
    return this.group;
  }

  public async fetchRoleModel(): Promise<Maybe<RoleModel>> {
    if (this.role) {
      return this.role;
    }

    if (this.roleId) {
      this.role = (await RoleModel.findOne({ where: { id: this.roleId } })) ?? undefined;
    }
    return this.role;
  }

  public async fetchUserModel(): Promise<Maybe<UserModel>> {
    if (this.user) {
      return this.user;
    }

    if (this.userId) {
      this.user = (await UserModel.findOne({ where: { id: this.userId } })) ?? undefined;
    }
    return this.user;
  }

  public async fetchGameModel(): Promise<Maybe<GameModel>> {
    if (this.game) {
      return this.game;
    }

    if (this.gameId) {
      this.game = (await GameModel.findOne({ where: { id: this.gameId } })) ?? undefined;
    }
    return this.game;
  }

  public async fetchPermissionModel(): Promise<Maybe<PermissionModel>> {
    return PermissionModel.findOne({ where: { id: this.permission } });
  }

  // passed in headers
  public divisionId?: number;

  public groupId?: number;

  public roleId?: number;

  public userId?: number;

  public gameId?: string;

  public permission?: string;

  // params
  private division?: DivisionModel;

  private group?: GroupModel;

  private role?: RoleModel;

  private user?: UserModel;

  private game?: GameModel;
}
