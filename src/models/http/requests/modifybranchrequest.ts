/**
 * An object containing branch information to update
 * This class should match modifyBranchRequest from BDS swagger
 */
export interface ModifyBranchRequest {
  // The branch password, use empty string to remove as null only means not set
  password: string;
}
