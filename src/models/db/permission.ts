import {
  Association,
  BelongsToManyGetAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  Model,
  ModelAttributes,
} from 'sequelize';
import { INTERNAL_STRING_ID } from '../defines/definitions';
import { RoleModel } from './role';

export const PermissionDef: ModelAttributes = {
  id: INTERNAL_STRING_ID(),
};

export const AccessPermissions = ['create', 'read', 'update', 'delete', 'update-production'] as const;
export const UserPermissions = ['create-account', 'remove-account', 'manage-access'] as const;
export const Permissions = [
  'create',
  'read',
  'update',
  'delete',
  'update-production',
  'create-account',
  'remove-account',
  'manage-access',
  'rbac-admin',
  'all-games-access',
] as const;

export type AccessPermissionType = typeof AccessPermissions[number];
export type UserPermissionType = typeof Permissions[number];
export type PermissionType = typeof Permissions[number];

export interface PermissionAttributes {
  id: PermissionType;
}

export type PermissionCreationAttributes = PermissionAttributes;

export class PermissionModel
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes {
  id!: PermissionType;

  public static async getModel(permission: PermissionType): Promise<PermissionModel> {
    const model = await this.findByPk(permission);
    if (model) {
      return model;
    }
    throw new Error('No permission model corresponding to passed in PermissionType, looks like db is set up wrong');
  }

  // #region association: roles
  public readonly rolesWithPermission?: RoleModel[];

  public createRolesWithPermission!: HasManyCreateAssociationMixin<RoleModel>;

  public removeRolesWithPermission!: HasManyRemoveAssociationMixin<RoleModel, number>;

  public getRolesWithPermission!: BelongsToManyGetAssociationsMixin<RoleModel>;
  // #endregion

  public static associations: {
    rolesWithPermission: Association<PermissionModel, RoleModel>;
  };
}
