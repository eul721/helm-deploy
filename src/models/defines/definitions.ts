import { DataTypes } from 'sequelize';
import { config } from '../../config';

const INTERNAL_ID_TYPE = () =>
  DataTypes.BIGINT({
    unsigned: !config.isTest(),
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
