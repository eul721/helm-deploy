export interface BranchDescription {
  /** Internal PS id */
  id: number;

  name: string;

  passwordProtected: boolean;

  ownerId: number;

  /** Branch bds id */
  bdsBranchId: number;
}
