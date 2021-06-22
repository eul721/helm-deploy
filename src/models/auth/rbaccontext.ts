import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { Response } from 'express';
import { BranchModel } from '../db/branch';
import { BuildModel } from '../db/build';
import { DivisionModel } from '../db/division';
import { GameModel } from '../db/game';
import { GroupModel } from '../db/group';
import { PermissionModel } from '../db/permission';
import { RoleModel } from '../db/role';
import { UserModel } from '../db/user';
import { ResourceContext } from './resourcecontext';

/**
 * Data set on a request context (res.locals.rbacContext) that contains information about the rbac request
 * This information is generally created by rbac middleware and used by the controllers/services
 */
export class RbacContext extends ResourceContext {
  constructor(
    divisionId?: number,
    groupId?: number,
    roleId?: number,
    userId?: number,
    permission?: string,
    game?: Maybe<GameModel>,
    branch?: Maybe<BranchModel>,
    build?: Maybe<BuildModel>
  ) {
    super(game, branch, build);
    this.divisionId = divisionId;
    this.groupId = groupId;
    this.roleId = roleId;
    this.userId = userId;
    this.permission = permission;
  }

  public static set(res: Response, context: RbacContext) {
    if (Object.prototype.hasOwnProperty.call(res.locals, 'rbacContext')) {
      throw new Error('RbacContext is already set');
    }
    res.locals.playerContext = context;
  }

  public static get(res: Response): RbacContext {
    if (Object.prototype.hasOwnProperty.call(res.locals, 'rbacContext')) {
      return res.locals.rbacContext as RbacContext;
    }
    throw new Error('Missing rbac context on the request, rbac middleware must have malfuntioned');
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

  public async fetchPermissionModel(): Promise<Maybe<PermissionModel>> {
    return PermissionModel.findOne({ where: { id: this.permission } });
  }

  // passed in headers
  public divisionId?: number;

  public groupId?: number;

  public roleId?: number;

  public userId?: number;

  public permission?: string;

  // params
  private division?: DivisionModel;

  private group?: GroupModel;

  private role?: RoleModel;

  private user?: UserModel;
}
