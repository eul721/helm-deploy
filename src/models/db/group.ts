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
import { UserModel } from './user';
import { RoleModel } from './role';
import { DivisionModel } from './division';

export const GroupDef: ModelAttributes = {
  id: INTERNAL_ID(),
  name: {
    allowNull: false,
    type: DataTypes.STRING(64),
    unique: false,
  },
  ownerId: INTERNAL_ID_REFERENCE(),
};

export interface GroupAttributes {
  id: number;
  name: string;
  ownerId: number;
}

export type GroupCreationAttributes = Optional<GroupAttributes, 'id' | 'ownerId'>;

export class GroupModel extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  id!: number;

  name!: string;

  ownerId!: number;

  // #region association: roles
  public readonly roles?: RoleModel[];

  public addAssignedRole!: BelongsToManyAddAssociationMixin<RoleModel, number>;

  public removeAssignedRole!: BelongsToManyRemoveAssociationMixin<RoleModel, number>;

  public getAssignedRoles!: BelongsToManyGetAssociationsMixin<RoleModel>;
  // #endregion

  // #region association: roles
  public readonly users?: UserModel[];

  public addAssignedUser!: BelongsToManyAddAssociationMixin<UserModel, number>;

  public removeAssignedUser!: BelongsToManyRemoveAssociationMixin<UserModel, number>;

  public getAssignedUsers!: BelongsToManyGetAssociationsMixin<UserModel>;
  // #endregion

  // #region association: owner
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    roles: Association<GroupModel, RoleModel>;
    users: Association<GroupModel, UserModel>;
    owner: Association<GroupModel, DivisionModel>;
  };
}
