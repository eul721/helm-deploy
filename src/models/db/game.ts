import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID } from '../defines/definitions';

export const GameDef: ModelAttributes = {
  id: INTERNAL_ID(),
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

export interface GameAttributes {
  id: number;
  contentfulId: string;
  bdsTitleId: number;
}

export type GameCreationAttributes = Optional<GameAttributes, 'id'>;

export class GameModel extends ModelBase<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsTitleId!: number;

  public static async findEntry(filter: WhereOptions<GameAttributes>): Promise<GameModel | null> {
    return <GameModel>await this.findEntryBase(filter);
  }
}
