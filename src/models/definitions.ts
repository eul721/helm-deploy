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

export enum PermissionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

/**
 * To avoid RBAC table names conflicting with potential real application table names,
 * manually specify each tablename
 */
export enum RBACTableNames {
  Group = 'rbac_groups',
  GroupRole = 'rbac_grouproles',
  Permission = 'rbac_permissions',
  Resource = 'rbac_resources',
  Role = 'rbac_roles',
  RolePermission = 'rbac_rolepermissions',
  User = 'rbac_users',
  UserGroup = 'rbac_usergroups',
  UserRole = 'rbac_userroles',
  UserRoleResource = 'rbac_userroleresources',
}

export const Role: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(64),
    unique: false,
  },
};

export const Permission: ModelAttributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING(32),
    unique: true,
  },
};

export const RolePermission: ModelAttributes = {
  roleId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.Role,
    },
  },
  permissionId: {
    allowNull: false,
    type: DataTypes.STRING(32),
    references: {
      key: 'id',
      model: RBACTableNames.Permission,
    },
  },
};

export const User: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
  // Like an email or Okta ID
  external_id: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: true,
  },
};

export const Group: ModelAttributes = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: INTERNAL_ID_TYPE(),
    unique: true,
  },
};

export const UserGroup: ModelAttributes = {
  groupId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.Group,
    },
  },
  userId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.User,
    },
  },
};

export const UserRole: ModelAttributes = {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: INTERNAL_ID_TYPE(),
  },
  userId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.User,
    },
  },
  roleId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.Role,
    },
  },
};

export const UserRoleResource: ModelAttributes = {
  userRoleId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.UserRole,
    },
    unique: 'uc_idtonamespace',
  },
  namespace: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: 'uc_idtonamespace',
  },
};

export const GroupRole: ModelAttributes = {
  groupId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.Group,
    },
  },
  roleId: {
    allowNull: false,
    type: INTERNAL_ID_TYPE(),
    references: {
      key: 'id',
      model: RBACTableNames.Role,
    },
  },
};
