import { BelongsToOptions, HasManyOptions, Options, Sequelize } from 'sequelize';
import { debug, error, info, warn } from '../../logger';
import { BranchDef, BranchModel } from './branch';
import { BuildDef, BuildModel } from './build';
import { GameDef, GameModel } from './game';
import { UserDef, UserModel } from './user';
import { DivisionDef, DivisionModel } from './division';
import { PermissionDef, PermissionModel } from './permission';
import { RoleDef, RoleModel } from './role';
import { TableNames } from '../defines/tablenames';
import { GroupDef, GroupModel } from './group';
import { envConfig } from '../../configuration/envconfig';

function getDBConf(): Options {
  const opts: Options = {
    database: envConfig.DATABASE_NAME,
    host: envConfig.DATABASE_HOST,
    logging: envConfig.DATABASE_DBG === 'true' ? debug : false,
    password: envConfig.DATABASE_PASS,
    username: envConfig.DATABASE_USER,
  };

  switch (envConfig.NODE_ENVIRONMENT) {
    // Test environment uses in-memory SQLite instead of MariaDB
    case 'test':
      opts.dialect = 'sqlite';
      opts.storage = ':memory:';
      break;
    case 'production':
    case 'development':
      if (
        !envConfig.DATABASE_HOST ||
        !envConfig.DATABASE_NAME ||
        !envConfig.DATABASE_PASS ||
        !envConfig.DATABASE_USER
      ) {
        warn('Missing environment=%s configuration in DB_CONFIG', envConfig.NODE_ENVIRONMENT);
        throw new Error('Missing or invalid configuration');
      }
      if (envConfig.DATABASE_PORT !== '') {
        const dbPort = parseInt(envConfig.DATABASE_PORT, 10);
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
    info('Successfully initialized db models');
  }

  return _sequelize;
}

export async function initializeDB() {
  try {
    const dropDb = envConfig.DATABASE_DROP === 'true' && envConfig.isDev();
    if (dropDb) {
      warn('Dropping old database');
    }
    info('About to sync db');
    const sq = await getDBInstance().sync({ force: dropDb, match: /_dev$/ });
    info('Sync done');
    await sq.authenticate();
    info('Successfully authenticated SQL connection');
  } catch (exc) {
    error(exc);
  }
}

function initModels() {
  BuildModel.init(BuildDef, { sequelize: getDBInstance(), tableName: TableNames.Build });
  BranchModel.init(BranchDef, { sequelize: getDBInstance(), tableName: TableNames.Branch });
  GameModel.init(GameDef, { sequelize: getDBInstance(), tableName: TableNames.Game });
  DivisionModel.init(DivisionDef, { sequelize: getDBInstance(), tableName: TableNames.Division });
  UserModel.init(UserDef, { sequelize: getDBInstance(), tableName: TableNames.User });
  PermissionModel.init(PermissionDef, { sequelize: getDBInstance(), tableName: TableNames.Permission });
  RoleModel.init(RoleDef, { sequelize: getDBInstance(), tableName: TableNames.Role });
  GroupModel.init(GroupDef, { sequelize: getDBInstance(), tableName: TableNames.Group });

  const belongsToDefaults: BelongsToOptions = { as: 'owner', targetKey: 'id' };
  const hasManyDefaults = (as: string): HasManyOptions => {
    return { as, sourceKey: 'id', foreignKey: 'ownerId' };
  };

  // games have builds and branches
  BuildModel.belongsTo(GameModel, belongsToDefaults);
  GameModel.hasMany(BuildModel, hasManyDefaults('builds'));
  BranchModel.belongsTo(GameModel, belongsToDefaults);
  GameModel.hasMany(BranchModel, hasManyDefaults('branches'));

  // divisions own all top level models
  GameModel.belongsTo(DivisionModel, belongsToDefaults);
  DivisionModel.hasMany(GameModel, hasManyDefaults('games'));
  UserModel.belongsTo(DivisionModel, belongsToDefaults);
  DivisionModel.hasMany(UserModel, hasManyDefaults('users'));
  RoleModel.belongsTo(DivisionModel, belongsToDefaults);
  DivisionModel.hasMany(RoleModel, hasManyDefaults('roles'));
  GroupModel.belongsTo(DivisionModel, belongsToDefaults);
  DivisionModel.hasMany(GroupModel, hasManyDefaults('groups'));

  // branches have a build history
  const BranchBuilds = getDBInstance().define('branch_builds', {});
  BranchModel.belongsToMany(BuildModel, { through: BranchBuilds, as: 'builds' });
  BuildModel.belongsToMany(BranchModel, { through: BranchBuilds, as: 'branches' });

  // groups have users and roles
  const GroupUsers = getDBInstance().define('rbac_group_users', {});
  GroupModel.belongsToMany(UserModel, { through: GroupUsers, as: 'assignedUsers', foreignKey: 'groupId' });
  UserModel.belongsToMany(GroupModel, { through: GroupUsers, as: 'groupsWithUser', foreignKey: 'userId' });
  const GroupRoles = getDBInstance().define('rbac_group_roles', {});
  GroupModel.belongsToMany(RoleModel, { through: GroupRoles, as: 'assignedRoles', foreignKey: 'groupId' });
  RoleModel.belongsToMany(GroupModel, { through: GroupRoles, as: 'groupsWithRole', foreignKey: 'roleId' });

  // roles have games and permissions
  const RoleGames = getDBInstance().define('rbac_role_games', {});
  RoleModel.belongsToMany(GameModel, { through: RoleGames, as: 'assignedGames', foreignKey: 'roleId' });
  GameModel.belongsToMany(RoleModel, { through: RoleGames, as: 'rolesWithGame', foreignKey: 'gameId' });
  const RolePermissions = getDBInstance().define('rbac_role_permissions', {});
  RoleModel.belongsToMany(PermissionModel, {
    through: RolePermissions,
    as: 'assignedPermissions',
    foreignKey: 'roleId',
  });
  PermissionModel.belongsToMany(RoleModel, {
    through: RolePermissions,
    as: 'rolesWithPermission',
    foreignKey: 'permissionId',
  });
}
