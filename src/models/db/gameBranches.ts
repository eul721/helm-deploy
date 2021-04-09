import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { INTERNAL_ID_TYPE, TableNames } from './definitions';
import { ModelBase } from './modelbase';

export const GameBranchesDef: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  gameId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    unique: false,
    references: {
      key: 'id',
      model: TableNames.Game,
    },
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

  public static async createEntry(params: GameBranchesCreationAttributes): Promise<GameBranchesModel> {
    return <GameBranchesModel>await this.createEntryBase(params);
  }

  public static async findEntry(filter: WhereOptions<GameBranchesAttributes>): Promise<GameBranchesModel | null> {
    return <GameBranchesModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<GameBranchesAttributes>): Promise<GameBranchesModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <GameBranchesModel>item);
  }
}
