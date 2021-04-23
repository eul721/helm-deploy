import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  DataTypes,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { DivisionModel } from './division';
import { GameModel } from './game';
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
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'ownerId'>;

export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  id!: number;

  name!: string;

  ownerId!: number;

  // #region association: permissions
  public readonly permissions?: PermissionModel[];

  public addAssignedPermission!: BelongsToManyAddAssociationMixin<PermissionModel, number>;

  public removeAssignedPermission!: BelongsToManyRemoveAssociationMixin<PermissionModel, number>;

  public getAssignedPermissions!: BelongsToManyGetAssociationsMixin<PermissionModel>;
  // #endregion

  // #region association: games
  public readonly games?: GameModel[];

  public addAssignedGame!: BelongsToManyAddAssociationMixin<GameModel, number>;

  public removeAssignedGame!: BelongsToManyRemoveAssociationMixin<GameModel, number>;

  public getAssignedGames!: BelongsToManyGetAssociationsMixin<GameModel>;
  // #endregion

  // #region association: owner
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    assignedPermissions: Association<RoleModel, PermissionModel>;
    assignedGames: Association<RoleModel, GameModel>;
    owner: Association<RoleModel, DivisionModel>;
  };
}
