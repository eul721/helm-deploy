import { PermissionType } from '../../db/permission';
import { GameDescription } from './gamedescription';

/**
 * Describes an RBAC role
 */
export interface RoleDescription {
  /** Internal PS id */
  id: number;

  /** Name of the role */
  name: string;

  /** Permissions assigned to this role */
  assignedPermissions?: PermissionType[];

  /** Games affected by the permissions in this role */
  assignedGames?: GameDescription[];
}
