import { DataTypes, Model, ModelAttributes, Optional } from 'sequelize';
import { envConfig } from '../../configuration/envconfig';
import { INTERNAL_ID } from '../../utils/database';
import { Locale } from '../../utils/language';

const TEXT_TYPE = () => DataTypes.TEXT(envConfig.isTest() ? undefined : { length: 'long' });

export const LocalizedFieldDef: ModelAttributes = {
  field: {
    allowNull: false,
    type: DataTypes.STRING(64),
  },
  id: {
    ...INTERNAL_ID(),
  },
  locale: {
    allowNull: false,
    type: DataTypes.STRING(10),
  },
  value: {
    allowNull: false,
    type: TEXT_TYPE(),
  },
};

export interface LocalizedFieldAttributes {
  /**
   * Property on item (eg: "name", "notes", etc)
   */
  field: Fields;
  id: number;
  /**
   * Locale the field represents
   */
  locale: Locale;
  value: string;
}

/**
 * All available field identifiers
 */
export enum Fields {
  name = 'name',
  description = 'description',
  patchnotes = 'patchnotes',
  url = 'url',
}

export type LocalizedFieldCreationAttributes = Optional<LocalizedFieldAttributes, 'id'>;

export class LocalizedFieldModel
  extends Model<LocalizedFieldAttributes, LocalizedFieldCreationAttributes>
  implements LocalizedFieldAttributes {
  public field!: Fields;

  public id!: number;

  public locale!: Locale;

  public value!: string;
}
