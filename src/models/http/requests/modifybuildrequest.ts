import { HashmapChangeRequest } from '../../../utils/language';

/**
 * An object containing build information to update
 * This class should match modifyBuildRequest from BDS swagger
 */
export interface ModifyBuildRequest {
  // The contentful id to assign to the title
  mandatory?: boolean;

  // Names to modify
  patchNotes?: HashmapChangeRequest;
}
