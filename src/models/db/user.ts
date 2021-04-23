import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';

export const UserDef: ModelAttributes = {
  id: INTERNAL_ID(),
  // Like an email or Okta ID
  externalId: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: true,
  },
  parentDivision: INTERNAL_ID_REFERENCE(TableNames.Division),
};

export interface UserAttributes {
  id: number;
  externalId: string;
  parentDivision: number;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class UserModel extends ModelBase<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;

  externalId!: string;

  parentDivision!: number;

  public static async findEntry(filter: WhereOptions<UserAttributes>): Promise<UserModel | null> {
    return <UserModel>await this.findEntryBase(filter);
  }
}
