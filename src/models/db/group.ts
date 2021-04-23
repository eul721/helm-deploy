import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { TableNames } from '../defines/tablenames';

export const GroupDef: ModelAttributes = {
  id: INTERNAL_ID(),
  name: {
    allowNull: false,
    type: DataTypes.STRING(64),
    unique: false,
  },
  parentDivision: INTERNAL_ID_REFERENCE(TableNames.Division),
};

export interface GroupAttributes {
  id: number;
  name: string;
  parentDivision: number;
}

export type GroupCreationAttributes = Optional<GroupAttributes, 'id'>;

export class GroupModel extends ModelBase<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  id!: number;

  name!: string;

  parentDivision!: number;

  public static async findEntry(filter: WhereOptions<GroupAttributes>): Promise<GroupModel | null> {
    return <GroupModel>await this.findEntryBase(filter);
  }
}
