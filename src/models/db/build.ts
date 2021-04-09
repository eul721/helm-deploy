import { DataTypes, ModelAttributes, Optional, WhereOptions } from 'sequelize';
import { ModelBase } from './modelbase';
import { INTERNAL_ID_TYPE } from './definitions';

export const BuildDef: ModelAttributes = {
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
  bdsBuildId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
};

interface BuildAttributes {
  id: number;
  contentfulId: string;
  bdsBuildId: number;
}

export type BuildCreationAttributes = Optional<BuildAttributes, 'id'>;

export class BuildModel extends ModelBase<BuildAttributes, BuildCreationAttributes> implements BuildAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsBuildId!: number;

  public static async createEntry(params: BuildCreationAttributes): Promise<BuildModel> {
    return <BuildModel>await this.createEntryBase(params);
  }

  public static async findEntry(filter: WhereOptions<BuildAttributes>): Promise<BuildModel | null> {
    return <BuildModel>await this.findEntryBase(filter);
  }
}
