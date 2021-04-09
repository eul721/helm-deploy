import { Options, Sequelize } from 'sequelize';
import { debug, info, warn } from '../../logger';
import { TableNames } from './definitions';
import { BranchDef, BranchModel } from './branch';
import { BranchBuildsDef, BranchBuildsModel } from './branchBuilds';
import { GameBranchesDef, GameBranchesModel } from './gameBranches';
import { BuildDef, BuildModel } from './build';
import { GameDef, GameModel } from './game';

const { NODE_ENVIRONMENT = 'development' } = process.env;

const {
  DATABASE_DBG = '',
  DATABASE_HOST = '',
  DATABASE_NAME = '',
  DATABASE_PASS = '',
  DATABASE_PORT = '',
  DATABASE_USER = '',
  DATABASE_DROP = '',
} = process.env;

function getDBConf(): Options {
  const opts: Options = {
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    logging: DATABASE_DBG === 'true' ? debug : false,
    password: DATABASE_PASS,
    username: DATABASE_USER,
  };

  switch (NODE_ENVIRONMENT) {
    // Test environment uses in-memory SQLite instead of MariaDB
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
    initModels();
  }

  return _sequelize;
}

export async function initializeDB() {
  try {
    const dropDb = DATABASE_DROP === 'true' && NODE_ENVIRONMENT === 'development';
    if (dropDb) {
      warn('Dropping old database');
    }
    const sq = await getDBInstance().sync({ force: dropDb, match: /_dev$/ });
    await sq.authenticate();
    info('Successfully authenticated SQL connection');
  } catch (dbError) {
    console.log('DBError:', dbError);
  }
}

async function initModels() {
  BuildModel.init(BuildDef, { sequelize: getDBInstance(), tableName: TableNames.Build });
  BranchModel.init(BranchDef, { sequelize: getDBInstance(), tableName: TableNames.Branch });
  GameModel.init(GameDef, { sequelize: getDBInstance(), tableName: TableNames.Game });

  BranchBuildsModel.init(BranchBuildsDef, {
    sequelize: getDBInstance(),
    tableName: TableNames.BranchBuilds,
  });

  GameBranchesModel.init(GameBranchesDef, {
    sequelize: getDBInstance(),
    tableName: TableNames.GameBranches,
  });
}
