/**
 * An object containing branch information to update
 * This class should match modifyBranchRequest from BDS swagger
 */
export interface ModifyBranchRequest {
  // The branch password, use empty string to remove as null only means not set
  password?: string;

  // Build history to replace current one with - list of publisher ids
  buildHistoryPsIds?: number[];

  // Build history to replace current one with - list of bds ids
  buildHistoryBdcIds?: number[];
}
