/**
 * Describes an RBAC (private Publisher) branch model
 */
export interface BranchDescription {
  /** Branch bds id */
  bdsBranchId: number;

  /** Internal PS id */
  id: number;

  names: Record<string, string>;

  ownerId: number;

  password?: string;
}
