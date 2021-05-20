import { PermissionType } from '../../db/permission';

/**
 * Describes an RBAC role
 */
export interface RoleDescription {
  /** Name of the role */
  name: string;

  /** Permissions assigned to this role */
  assignedPermissions?: PermissionType[];

  /** Games affected by the permissions in this role */
  assignedGames?: string[];
}
