import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  DataTypes,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../../utils/database';
import { UserModel } from './user';
import { RoleModel } from './role';
import { DivisionModel } from './division';
import { GroupDescription } from '../http/rbac/groupdescription';

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
  readonly assignedRoles?: RoleModel[];
  readonly assignedUsers?: UserModel[];
  readonly owner?: DivisionModel;
}

export type GroupCreationAttributes = Optional<GroupAttributes, 'id' | 'ownerId'>;

export class GroupModel extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  id!: number;

  name!: string;

  ownerId!: number;

  // #region association: roles
  public readonly assignedRoles?: RoleModel[];

  public addAssignedRole!: BelongsToManyAddAssociationMixin<RoleModel, number>;

  public addAssignedRoles!: BelongsToManyAddAssociationsMixin<RoleModel, number>;

  public removeAssignedRole!: BelongsToManyRemoveAssociationMixin<RoleModel, number>;

  public getAssignedRoles!: BelongsToManyGetAssociationsMixin<RoleModel>;
  // #endregion

  // #region association: roles
  public readonly assignedUsers?: UserModel[];

  public addAssignedUser!: BelongsToManyAddAssociationMixin<UserModel, number>;

  public addAssignedUsers!: BelongsToManyAddAssociationsMixin<UserModel, number>;

  public removeAssignedUser!: BelongsToManyRemoveAssociationMixin<UserModel, number>;

  public getAssignedUsers!: BelongsToManyGetAssociationsMixin<UserModel>;
  // #endregion

  // #region association: owner
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    assignedRoles: Association<GroupModel, RoleModel>;
    assignedUsers: Association<GroupModel, UserModel>;
    owner: Association<GroupModel, DivisionModel>;
  };

  public toHttpModel(): GroupDescription {
    return {
      id: this.id,
      name: this.name,
      divisionId: this.ownerId,
      users: this.assignedUsers?.map(user => user.toHttpModel()),
      roles: this.assignedRoles?.map(role => role.toHttpModel()),
    };
  }
}
