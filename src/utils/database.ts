import { DataTypes } from 'sequelize';
import { envConfig } from '../configuration/envconfig';

export const INTERNAL_ID_TYPE = () =>
  DataTypes.BIGINT({
    unsigned: !envConfig.isTest(),
    length: 32,
  });

const INTERNAL_STRING_ID_TYPE = (size: number) => DataTypes.STRING(size);

export const INTERNAL_ID = () => {
  return {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  };
};

export const INTERNAL_STRING_ID = () => {
  return { allowNull: false, primaryKey: true, type: INTERNAL_STRING_ID_TYPE(32), unique: true };
};

export const INTERNAL_ID_REFERENCE = () => {
  return {
    allowNull: true,
    type: INTERNAL_ID_TYPE(),
    unique: false,
  };
};

/**
 * Starting AUTO_INCREMENT value for PS model IDs
 *
 * Note: these are Strings to support Sequelize
 */
export enum MODEL_ID_DEFAULTS {
  BranchModel = '200000',
  BuildModel = '400000',
  GameModel = '100000',
}

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
