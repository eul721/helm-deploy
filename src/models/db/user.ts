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
import { GroupModel } from './group';

export const UserDef: ModelAttributes = {
  id: INTERNAL_ID(),
  // Like an email or Okta ID
  externalId: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: true,
  },
  ownerId: INTERNAL_ID_REFERENCE(),
};

export interface UserAttributes {
  id: number;
  externalId: string;
  ownerId: number;
  readonly groupsWithUser?: GroupModel[];
  readonly owner?: DivisionModel;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'ownerId'>;

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;

  externalId!: string;

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
}
