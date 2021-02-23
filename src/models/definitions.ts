import { DataTypes, ModelAttributes } from 'sequelize';

const IS_TEST = process.env.NODE_ENVIRONMENT === 'test';

const INTERNAL_ID_TYPE = () =>
  DataTypes.BIGINT({
    unsigned: !IS_TEST,
    length: 32,
  });

export const Game: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  contentfulId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
  titleId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
};

export const Build: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  contentfulId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
  buildId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
};

export const Branch: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  contentfulId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
  gameId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    unique: false,
    references: {
      key: 'id',
      model: 'games',
    },
  },
  branchId: {
    allowNull: true,
    type: DataTypes.STRING(256),
    unique: true,
  },
  buildId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    unique: false,
    references: {
      key: 'id',
      model: 'builds',
    },
  },
};
