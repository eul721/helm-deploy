/* eslint-disable max-classes-per-file */
import { Model, QueryTypes } from 'sequelize';
import { debug } from '../logger';

import { getDBInstance } from './database';
import {
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
  PermissionType,
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
  get id(): number {
    return this.getDataValue('id');
  }
}

export class Group extends Model {}
export class GroupRole extends Model {}
export class Permission extends Model {}
export class Role extends Model {}
export class RolePermission extends Model {}
export class User extends RModel {
  /**
   * Given an action, return the selected user's list of Resources
   * @param action Action selector to filter resources on
   */
  static async getUserResourceDefinitions(userId: number, action: PermissionType): Promise<Array<string>> {
    // Placeholder manual query until a more robust solution is implemented
    const result = await User.sequelize?.query<{ namespace: string }>(
      `SELECT urr.namespace
      FROM rbac_users AS u
      JOIN rbac_userroles AS ur
        ON u.id=ur.userId
      JOIN rbac_roles AS r
        ON ur.roleId=r.id
      JOIN rbac_userroleresources AS urr
        ON urr.userRoleId=ur.id
      JOIN rbac_rolepermissions AS rp
        ON rp.roleId=r.id
      JOIN rbac_permissions AS perm
        ON rp.permissionId=perm.id
      WHERE u.id="${userId}" AND perm.id="${action}";`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return result?.map(item => item.namespace) || [];
  }
}
export class UserGroup extends Model {}
export class UserRole extends RModel {
  get roleId(): number {
    return this.getDataValue('roleId');
  }
}
export class UserRoleResource extends Model {
  get namespace(): string {
    return this.getDataValue('namespace');
  }

  get userRoleId(): number {
    return this.getDataValue('userRoleId');
  }
}

/**
 * Tests if the given user, via any of their directly entitled Roles, is allowed to READ the given
 * resource.
 *
 * @param userId UserID to authorize
 * @param resource Fully qualified namespace path of the resource to test against
 */
export async function userCanRead(userId: number, resource: string): Promise<boolean> {
  console.log('Testing userId=%s resource=%s', userId, resource);
  const userResourseDefs = await User.getUserResourceDefinitions(userId, PermissionType.READ);
  return (
    userResourseDefs.filter(userResourceDef => isResourceContainedByNamespace(resource, userResourceDef)).length > 0
  );
}

/**
 * Tests if the given user, via any of their directly entitled Roles, is allowed to UPDATE the given
 * resource.
 *
 * @param userId UserId to authorize
 * @param resource Fully qualified namespace path of the resource to test against
 */
export async function userCanWrite(userId: number, resource: string): Promise<boolean> {
  debug('Testing user=%d can write resource=%s', userId, resource);
  const userResourceDefs = await User.getUserResourceDefinitions(userId, PermissionType.UPDATE);
  return (
    userResourceDefs.filter(userresourceDef => isResourceContainedByNamespace(resource, userresourceDef)).length > 0
  );
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
Permission.init(PermissionDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Permission });
Role.init(RoleDef, { sequelize: getDBInstance(), tableName: RBACTableNames.Role });
RolePermission.init(RolePermissionDef, { sequelize: getDBInstance(), tableName: RBACTableNames.RolePermission });
User.init(UserDef, { sequelize: getDBInstance(), tableName: RBACTableNames.User });
UserGroup.init(UserGroupDef, { sequelize: getDBInstance(), tableName: RBACTableNames.UserGroup });
UserRole.init(UserRoleDef, { sequelize: getDBInstance(), tableName: RBACTableNames.UserRole });
UserRoleResource.init(UserRoleResourceDef, { sequelize: getDBInstance(), tableName: RBACTableNames.UserRoleResource });
