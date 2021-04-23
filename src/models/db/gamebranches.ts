import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const GameBranchesDef: ModelAttributes = {
  id: INTERNAL_ID(),
  gameId: INTERNAL_ID_REFERENCE(TableNames.Game),
  branchId: INTERNAL_ID_REFERENCE(TableNames.Branch),
};

export interface GameBranchesAttributes {
  id: number;
  gameId: number;
  branchId: number;
}

export type GameBranchesCreationAttributes = Optional<GameBranchesAttributes, 'id'>;

export class GameBranchesModel
  extends ModelBase<GameBranchesAttributes, GameBranchesCreationAttributes>
  implements GameBranchesAttributes {
  id!: number;

  gameId!: number;

  branchId!: number;

  public static async findEntry(filter: WhereOptions<GameBranchesAttributes>): Promise<GameBranchesModel | null> {
    return <GameBranchesModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<GameBranchesAttributes>): Promise<GameBranchesModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <GameBranchesModel>item);
  }
}
