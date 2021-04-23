import { Association, BelongsToGetAssociationMixin, DataTypes, Model, ModelAttributes, Optional } from 'sequelize';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { DivisionModel } from './division';

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
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'ownerId'>;

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;

  externalId!: string;

  ownerId!: number;

  // #region association: games
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    owner: Association<UserModel, DivisionModel>;
  };
}
