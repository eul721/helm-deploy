import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { TableNames } from '../defines/tablenames';

export const RoleDef: ModelAttributes = {
  id: INTERNAL_ID(),
  name: {
    allowNull: false,
    type: DataTypes.STRING(64),
    unique: false,
  },
  parentDivision: INTERNAL_ID_REFERENCE(TableNames.Division),
};

export interface RoleAttributes {
  id: number;
  name: string;
  parentDivision: number;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;

export class RoleModel extends ModelBase<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  id!: number;

  name!: string;

  parentDivision!: number;

  public static async findEntry(filter: WhereOptions<RoleAttributes>): Promise<RoleModel | null> {
    return <RoleModel>await this.findEntryBase(filter);
  }
}
