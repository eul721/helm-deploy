import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID_REFERENCE, INTERNAL_ID, INTERNAL_STRING_ID_REFERENCE } from '../defines/definitions';
import { ModelBase } from './modelbase';
import { PermissionType } from './permission';

export const RolePermissionsDef: ModelAttributes = {
  id: INTERNAL_ID(),
  roleId: INTERNAL_ID_REFERENCE(TableNames.Role),
  permissionId: INTERNAL_STRING_ID_REFERENCE(TableNames.Permission),
};

export interface RolePermissionsAttributes {
  id: number;
  roleId: number;
  permissionId: PermissionType;
}

export type RolePermissionsCreationAttributes = Optional<RolePermissionsAttributes, 'id'>;

export class RolePermissionsModel
  extends ModelBase<RolePermissionsAttributes, RolePermissionsCreationAttributes>
  implements RolePermissionsAttributes {
  id!: number;

  roleId!: number;

  permissionId!: PermissionType;

  public static async findEntry(filter: WhereOptions<RolePermissionsAttributes>): Promise<RolePermissionsModel | null> {
    return <RolePermissionsModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<RolePermissionsAttributes>): Promise<RolePermissionsModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <RolePermissionsModel>item);
  }
}
