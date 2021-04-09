import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { INTERNAL_ID_TYPE, TableNames } from './definitions';
import { ModelBase } from './modelbase';

export const BranchBuildsDef: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  branchId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    unique: false,
    references: {
      key: 'id',
      model: TableNames.Branch,
    },
  },
  buildId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    unique: false,
    references: {
      key: 'id',
      model: TableNames.Build,
    },
  },
};

export interface BranchBuildsAttributes {
  id: number;
  branchId: number;
  buildId: number;
}

export type BranchBuildsCreationAttributes = Optional<BranchBuildsAttributes, 'id'>;

export class BranchBuildsModel
  extends ModelBase<BranchBuildsAttributes, BranchBuildsCreationAttributes>
  implements BranchBuildsAttributes {
  id!: number;

  branchId!: number;

  buildId!: number;

  public static async createEntry(params: BranchBuildsCreationAttributes): Promise<BranchBuildsModel> {
    return <BranchBuildsModel>await this.createEntryBase(params);
  }

  public static async findEntry(filter: WhereOptions<BranchBuildsAttributes>): Promise<BranchBuildsModel | null> {
    return <BranchBuildsModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<BranchBuildsAttributes>): Promise<BranchBuildsModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <BranchBuildsModel>item);
  }
}
