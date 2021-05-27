import { PermissionType } from '../../db/permission';

/**
 * Describes an RBAC permission
 */
export interface PermissionDescription {
  /** Username */
  id: PermissionType;
}
