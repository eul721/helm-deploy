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
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../../utils/database';
import { UserDescription } from '../http/rbac/userdescription';
import { DivisionModel } from './division';
import { GroupModel } from './group';

export const UserDef: ModelAttributes = {
  id: INTERNAL_ID(),
  // Like an email or Okta ID
  externalId: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: true,
  },
  // type/provider of externalId
  accountType: {
    allowNull: false,
    type: DataTypes.STRING(128),
  },
  ownerId: INTERNAL_ID_REFERENCE(),
};

export type AccountType = 'dev-login' | '2K-dna';

export interface UserAttributes {
  id: number;
  externalId: string;
  accountType: AccountType;
  ownerId: number;
  readonly groupsWithUser?: GroupModel[];
  readonly owner?: DivisionModel;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'ownerId'>;

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;

  externalId!: string;

  accountType!: AccountType;

  ownerId!: number;

  // #region association: permissions
  public readonly groupsWithUser?: GroupModel[];

  public addGroupsWithUser!: BelongsToManyAddAssociationMixin<GroupModel, number>;

  public removeGroupsWithUser!: BelongsToManyRemoveAssociationMixin<GroupModel, number>;

  public getGroupsWithUser!: BelongsToManyGetAssociationsMixin<GroupModel>;
  // #endregion

  // #region association: games
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    groupsWithUser: Association<UserModel, GroupModel>;
    owner: Association<UserModel, DivisionModel>;
  };

  public toHttpModel(): UserDescription {
    return {
      id: this.id,
      name: this.externalId,
      groups: this.groupsWithUser?.map(group => group.toHttpModel()),
    };
  }
}
