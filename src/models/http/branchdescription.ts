/**
 * Describes a Download (public Download) branch model
 */
export interface PublicBranchDescription {
  /** Internal PS id */
  id: number;

  names: Record<string, string>;

  passwordProtected: boolean;

  ownerId: number;

  /** Branch bds id */
  bdsBranchId: number;
}
