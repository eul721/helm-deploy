import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../../utils/database';
import { RoleDescription } from '../http/rbac/roledescription';
import { DivisionModel } from './division';
import { GameModel } from './game';
import { GroupCreationAttributes, GroupModel } from './group';
import { PermissionModel } from './permission';

export const RoleDef: ModelAttributes = {
  id: INTERNAL_ID(),
  name: {
    allowNull: false,
    type: DataTypes.STRING(64),
    unique: false,
  },
  ownerId: INTERNAL_ID_REFERENCE(),
};

export interface RoleAttributes {
  id: number;
  name: string;
  ownerId: number;
  readonly assignedPermissions?: PermissionModel[];
  readonly assignedGames?: GameModel[];
  readonly owner?: DivisionModel;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'ownerId'>;

export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  id!: number;

  name!: string;

  ownerId!: number;

  // #region association: permissions
  public readonly assignedPermissions?: PermissionModel[];

  public addAssignedPermission!: BelongsToManyAddAssociationMixin<PermissionModel, number>;

  public addAssignedPermissions!: BelongsToManyAddAssociationsMixin<PermissionModel, number>;

  public removeAssignedPermission!: BelongsToManyRemoveAssociationMixin<PermissionModel, number>;

  public getAssignedPermissions!: BelongsToManyGetAssociationsMixin<PermissionModel>;
  // #endregion

  // #region association: games
  public readonly assignedGames?: GameModel[];

  public addAssignedGame!: BelongsToManyAddAssociationMixin<GameModel, number>;

  public addAssignedGames!: BelongsToManyAddAssociationsMixin<GameModel, number>;

  public removeAssignedGame!: BelongsToManyRemoveAssociationMixin<GameModel, number>;

  public getAssignedGames!: BelongsToManyGetAssociationsMixin<GameModel>;
  // #endregion

  // #region association: groups
  public readonly groupsWithRole?: GroupModel[];

  public createGroupsWithRole!: HasManyCreateAssociationMixin<GroupModel>;

  public removeGroupsWithRole!: HasManyRemoveAssociationMixin<GroupModel, number>;

  public getGroupsWithRole!: HasManyGetAssociationsMixin<GroupModel>;

  public createGroupEntry(attributes: GroupCreationAttributes): Promise<GroupModel> {
    return this.createGroupsWithRole(attributes);
  }
  // #endregion

  // #region association: owner
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    assignedPermissions: Association<RoleModel, PermissionModel>;
    assignedGames: Association<RoleModel, GameModel>;
    owner: Association<RoleModel, DivisionModel>;
    groupsWithRole: Association<RoleModel, GroupModel>;
  };

  public toPublisherHttpModel(): RoleDescription {
    return {
      id: this.id,
      name: this.name,
      assignedPermissions: this.assignedPermissions?.map(role => role.id),
      assignedGames: this.assignedGames?.map(game => game.toPublisherHttpModel()),
    };
  }
}
