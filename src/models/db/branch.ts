import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID } from '../defines/definitions';

export const BranchDef: ModelAttributes = {
  id: INTERNAL_ID(),
  contentfulId: {
    allowNull: false,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsBranchId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
};

export interface BranchAttributes {
  id: number;
  contentfulId: string;
  bdsBranchId: number;
}

export type BranchCreationAttributes = Optional<BranchAttributes, 'id'>;

export class BranchModel extends ModelBase<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsBranchId!: number;

  public static async findEntry(filter: WhereOptions<BranchAttributes>): Promise<BranchModel | null> {
    return <BranchModel>await this.findEntryBase(filter);
  }
}
