import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID_TYPE } from './definitions';

export const GameDef: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  contentfulId: {
    allowNull: false,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsTitleId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
};

interface GameAttributes {
  id: number;
  contentfulId: string;
  bdsTitleId: number;
}

export type GameCreationAttributes = Optional<GameAttributes, 'id'>;

export class GameModel extends ModelBase<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsTitleId!: number;

  public static async createEntry(params: GameCreationAttributes): Promise<GameModel> {
    return <GameModel>await this.createEntryBase(params);
  }

  public static async findEntry(filter: WhereOptions<GameAttributes>): Promise<GameModel | null> {
    return <GameModel>await this.findEntryBase(filter);
  }
}
