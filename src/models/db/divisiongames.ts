import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const DivisionGamesDef: ModelAttributes = {
  id: INTERNAL_ID(),
  divisionId: INTERNAL_ID_REFERENCE(TableNames.Division),
  gameId: INTERNAL_ID_REFERENCE(TableNames.Game),
};

export interface DivisionGamesAttributes {
  id: number;
  gameId: number;
  branchId: number;
}

export type DivisionGamesCreationAttributes = Optional<DivisionGamesAttributes, 'id'>;

export class DivisionGamesModel
  extends ModelBase<DivisionGamesAttributes, DivisionGamesCreationAttributes>
  implements DivisionGamesAttributes {
  id!: number;

  gameId!: number;

  branchId!: number;

  public static async findEntry(filter: WhereOptions<DivisionGamesAttributes>): Promise<DivisionGamesModel | null> {
    return <DivisionGamesModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<DivisionGamesAttributes>): Promise<DivisionGamesModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <DivisionGamesModel>item);
  }
}
