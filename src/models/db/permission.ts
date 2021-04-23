import { ModelAttributes, WhereOptions } from 'sequelize';
import { INTERNAL_STRING_ID } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const PermissionDef: ModelAttributes = {
  id: INTERNAL_STRING_ID(),
};

export const AccessPermissions: string[] = ['create', 'read', 'update', 'delete', 'update-production'];
export const UserPermissions: string[] = ['create-account', 'remove-account', 'manage-access'];
export const Permissions: string[] = ['rbac-admin', 'all-games-access']
  .concat(AccessPermissions)
  .concat(UserPermissions);

export type AccessPermissionType = typeof AccessPermissions[number];
export type UserPermissionType = typeof Permissions[number];
export type PermissionType = typeof Permissions[number];

export interface PermissionAttributes {
  id: PermissionType;
}

export type PermissionCreationAttributes = PermissionAttributes;

export class PermissionModel
  extends ModelBase<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes {
  id!: PermissionType;

  public static async findEntry(filter: WhereOptions<PermissionAttributes>): Promise<PermissionModel | null> {
    return <PermissionModel>await this.findEntryBase(filter);
  }
}
