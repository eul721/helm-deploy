import { GroupDescription } from './groupdescription';

/**
 * Describes an RBAC user
 */
export interface UserDescription {
  /** Username */
  name: string;

  /** Groups this user belongs to */
  groups?: GroupDescription[];
}
