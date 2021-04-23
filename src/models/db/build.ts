import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID } from '../defines/definitions';

export const BuildDef: ModelAttributes = {
  id: INTERNAL_ID(),
  contentfulId: {
    allowNull: false,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsBuildId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
};

export interface BuildAttributes {
  id: number;
  contentfulId: string;
  bdsBuildId: number;
}

export type BuildCreationAttributes = Optional<BuildAttributes, 'id'>;

export class BuildModel extends ModelBase<BuildAttributes, BuildCreationAttributes> implements BuildAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsBuildId!: number;

  public static async findEntry(filter: WhereOptions<BuildAttributes>): Promise<BuildModel | null> {
    return <BuildModel>await this.findEntryBase(filter);
  }
}
