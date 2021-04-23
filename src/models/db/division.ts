import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID } from '../defines/definitions';

export const DivisionDef: ModelAttributes = {
  id: INTERNAL_ID(),
  name: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: true,
  },
};

export interface DivisionAttributes {
  id: number;
  name: string;
}

export type DivisionCreationAttributes = Optional<DivisionAttributes, 'id'>;

export class DivisionModel
  extends ModelBase<DivisionAttributes, DivisionCreationAttributes>
  implements DivisionAttributes {
  id!: number;

  name!: string;

  public static async findEntry(filter: WhereOptions<DivisionAttributes>): Promise<DivisionModel | null> {
    return <DivisionModel>await this.findEntryBase(filter);
  }
}
