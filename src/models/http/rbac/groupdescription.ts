import { RoleDescription } from './roledescription';
import { UserDescription } from './userdescription';

/**
 * Describes an RBAC group
 */
export interface GroupDescription {
  /** Name of the group */
  name: string;

  /** Owning division id */
  divisionId: number;

  /** Roles assigned to this group, set if present in db model during mapping */
  roles?: RoleDescription[];

  /** Users who belong to this group, set if present in db model during mapping */
  users?: UserDescription[];
}
