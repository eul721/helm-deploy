import {
  Association,
  BelongsToManyGetAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  Model,
  ModelAttributes,
} from 'sequelize';
import { INTERNAL_STRING_ID } from '../defines/definitions';
import { PermissionDescription } from '../http/rbac/permissiondescription';
import { RoleModel } from './role';

export const PermissionDef: ModelAttributes = {
  id: INTERNAL_STRING_ID(),
};

// access permissions relate to binaries and metadata, targeted game must be in the same division as the owning group/role
export const ResourcePermissions = [
  'create',
  'read',
  'update',
  'delete',
  'change-production', // modifier applied to create/read/update/delete, allows applying them to live/released data
] as const;

// user permissions relate to managing users and rbac itself, they apply only to the division that owns owns the groups/roles that have them
export const DivisionPermissions = [
  'rbac-admin', // allows modifying rbac resources and assigning users
  'create-account', // account creation within division
  'remove-account', // account deletion within division
  'all-games-access', // for ease of permission-setting, roles with this should be granted access to all new / current on creation (logic should be part of RBAC rather than querying)

  't2-admin', // special permission, will need to figure out how to handle
] as const;

export type ResourcePermissionType = typeof ResourcePermissions[number];
export type DivisionPermissionType = typeof DivisionPermissions[number];
export type PermissionType = ResourcePermissionType | DivisionPermissionType;

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

  public toHttpModel(): PermissionDescription {
    return { id: this.id };
  }
}
