import { GroupDescription } from './groupdescription';

/**
 * Describes an RBAC user
 */
export interface UserDescription {
  /** Internal PS id */
  id: number;

  /** Username */
  name: string;

  /** Groups this user belongs to */
  groups?: GroupDescription[];
}
