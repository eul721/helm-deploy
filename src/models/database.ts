import { Options, Sequelize } from 'sequelize';
import * as ModelDefs from './definitions';
import { Branch } from './branch';
import { Build } from './build';
import { Game } from './game';
import { info, warn } from '../logger';

const { NODE_ENVIRONMENT = 'development' } = process.env;

const DB_CONFIG: Record<string, Options> = {
  development: {
    database: 'publisher_dev',
    dialect: 'mariadb',
    host: 'localhost',
    password: 'password',
    port: 3306,
    username: 'root',
  },
  production: {},
  test: {
    database: 'publisher_test',
    dialect: 'sqlite',
    logging: false,
    storage: ':memory:',
  },
};

if (!DB_CONFIG[NODE_ENVIRONMENT]) {
  warn('Missing environment=%s configuration in DB_CONFIG', NODE_ENVIRONMENT);
  throw new Error('Missing or invalid configuration');
}

export const sequelize = new Sequelize(DB_CONFIG[NODE_ENVIRONMENT]);

Game.init(ModelDefs.Game, { sequelize, tableName: 'games' });
Build.init(ModelDefs.Build, { sequelize, tableName: 'builds' });
Branch.init(ModelDefs.Branch, { sequelize, tableName: 'branches' });

export async function initializeDB() {
  const sq = await sequelize.sync({ force: NODE_ENVIRONMENT === 'development', match: /_dev$/ });
  await sq.authenticate();
  info('Successfully authenticated SQL connection');
}
