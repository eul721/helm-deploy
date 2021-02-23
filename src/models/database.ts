import { Options, Sequelize } from 'sequelize';
import { info, warn } from '../logger';

const { NODE_ENVIRONMENT = 'development' } = process.env;

const {
  DATABASE_DBG = '',
  DATABASE_HOST = '',
  DATABASE_NAME = '',
  DATABASE_PASS = '',
  DATABASE_PORT = '',
  DATABASE_USER = '',
} = process.env;

function getDBConf(): Options {
  const opts: Options = {
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    logging: DATABASE_DBG === 'verbose',
    password: DATABASE_PASS,
    username: DATABASE_USER,
  };

  switch (NODE_ENVIRONMENT) {
    case 'test':
      opts.dialect = 'sqlite';
      opts.storage = ':memory:';
      break;
    case 'production':
    case 'development':
      if (!DATABASE_HOST || !DATABASE_NAME || !DATABASE_PASS || !DATABASE_USER) {
        warn('Missing environment=%s configuration in DB_CONFIG', NODE_ENVIRONMENT);
        throw new Error('Missing or invalid configuration');
      }
      if (DATABASE_PORT !== '') {
        const dbPort = parseInt(DATABASE_PORT, 10);
        if (Number.isNaN(dbPort)) {
          warn('DATABASE_PORT provided is not a valid number');
          throw new Error('Missing or invalid configuration');
        }
        opts.port = dbPort;
      }
      opts.dialect = 'mariadb';
      break;
    default:
      break;
  }
  return opts;
}

let _sequelize: Sequelize;

export function getDBInstance() {
  if (!_sequelize) {
    _sequelize = new Sequelize(getDBConf());
  }

  return _sequelize;
}

export async function initializeDB() {
  const sq = await getDBInstance().sync({ force: NODE_ENVIRONMENT === 'development', match: /_dev$/ });
  await sq.authenticate();
  info('Successfully authenticated SQL connection');
}
