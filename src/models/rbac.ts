/* eslint-disable max-classes-per-file */
import { Model, Op } from 'sequelize';

import { getDBInstance } from './database';
import {
  Namespace as NamespaceDef,
  Role as RoleDef,
  UserRoleResource as UserRoleResourceDef,
  Permission as PermissionDef,
  RolePermission as RolePermissionDef,
  User as UserDef,
  Group as GroupDef,
  UserGroup as UserGroupDef,
  UserRole as UserRoleDef,
  GroupRole as GroupRoleDef,
  RBACTableNames,
} from './definitions';

/**
 * TODO: split these up into separate files instead of having multiple classes
 * in this file, then remove the eslint max-classes-per-file from this header
 * During active iteration and development, it's much easier to maintain one big file
 */

/**
 * @description Basic RBAC Model. Extend this instead of {{sequelize.Model}}
 */
class RModel extends Model {
  id(): number {
    return this.getDataValue('id');
  }
}

export class Group extends Model {}
export class GroupRole extends Model {}
export class Namespace extends Model {}
export class Permission extends Model {}
export class Role extends Model {}
export class RolePermission extends Model {}
export class User extends RModel {}
export class UserGroup extends Model {}
export class UserRole extends Model {}
export class UserRoleResource extends Model {}

/**
 * Tests if the given user, via any of their directly entitled Roles, is allowed to READ the given
 * resource.
 *
 * @param userId UserID to authorize
 * @param resource Fully qualified namespace path of the resource to test against
 */
export async function userCanRead(userId: number, resource: string): Promise<boolean> {
  // Get all UserRoles with the user
  const userRoles = await UserRole.findAll({
    where: {
      userId,
    },
  });
  const userRoleResources = await UserRoleResource.findAll({
    where: {
      userRoleId: {
        [Op.in]: userRoles.map(role => role.getDataValue('id')),
      },
    },
  });

  if (userRoleResources.length === 0) {
    return false;
  }

  for (let resourceDefIdx = 0; resourceDefIdx < userRoleResources.length; resourceDefIdx++) {
    const namespace = userRoleResources[resourceDefIdx].getDataValue('namespace');
    if (isResourceContainedByNamespace(resource, namespace)) {
      return true;
    }
  }
  return false;
}

/**
 * Tests whether or not the given resource is covered by the given namespaceDef.
 *
 * This method is to be used when testing user access via UserRoleResource namespace definitions
 *
 * @param resource Resource identifier to test
 * @param namespaceDef Namespace definition to test against
 */
export function isResourceContainedByNamespace(resource: string, namespaceDef: string): boolean {
  if (!resource.startsWith('/') || !namespaceDef.startsWith('/')) {
    throw new Error('Invalid Resource or Namespace');
  }

  const [, nsRoot, nsType, nsId] = namespaceDef.split('/');
  const [, rsRoot, rsType, rsId] = resource.split('/');

  if (nsRoot === '*') {
    return true;
  }

  if (nsRoot !== rsRoot) {
    return false;
  }

  if (nsType === '*') {
    return true;
  }

  if (nsType !== rsType) {
    return false;
  }

  if (nsId === '*') {
    return true;
  }

  if (nsId === rsId) {
    return true;
  }

  return false;
}

// Batch initialize the entire RBAC service in this file
Group.init(GroupDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Group });
GroupRole.init(GroupRoleDef, { sequelize: getDBInstance(), tableName: RBACTableNames.GroupRole });
Namespace.init(NamespaceDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Namespace });
Permission.init(PermissionDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Permission });
Role.init(RoleDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Role });
RolePermission.init(RolePermissionDef, { sequelize: getDBInstance(), tableName: RBACTableNames.RolePermission });
User.init(UserDef, { sequelize: getDBInstance(), tableName: RBACTableNames.User });
UserGroup.init(UserGroupDef, { sequelize: getDBInstance(), tableName: RBACTableNames.UserGroup });
UserRole.init(UserRoleDef, { sequelize: getDBInstance(), tableName: RBACTableNames.UserRole });
UserRoleResource.init(UserRoleResourceDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Resource });
