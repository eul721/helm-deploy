/**
 * An object containing build information to update
 * This class should match modifyBuildRequest from BDS swagger
 */
export interface ModifyBuildRequest {
  // The contentful id to assign to the title
  mandatory?: boolean;

  // Patch notes resource id
  patchNotesId?: string;
}
