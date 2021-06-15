/**
 * An object containing title information to update
 * This class should match modifyGameRequest from BDS swagger
 */
export interface ModifyTitleRequest {
  // The bds if of branch to set as default
  defaultBranchBdsId?: string;

  // The publisher service id of branch to set as default
  defaultBranchPsId?: string;

  // The contentful id to assign to the title
  contentfulId?: string;
}
