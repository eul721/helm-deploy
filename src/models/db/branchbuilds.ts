import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const BranchBuildsDef: ModelAttributes = {
  id: INTERNAL_ID(),
  branchId: INTERNAL_ID_REFERENCE(TableNames.Branch),
  buildId: INTERNAL_ID_REFERENCE(TableNames.Build),
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

  public static async findEntry(filter: WhereOptions<BranchBuildsAttributes>): Promise<BranchBuildsModel | null> {
    return <BranchBuildsModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<BranchBuildsAttributes>): Promise<BranchBuildsModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <BranchBuildsModel>item);
  }
}
