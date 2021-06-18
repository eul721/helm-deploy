import { LocalizedHashmap } from '../../../utils/language';

/**
 * Describes a Download (public Download) branch model
 */
export interface PublicBranchDescription {
  /** Internal PS id */
  id: number;

  names: LocalizedHashmap;

  passwordProtected: boolean;

  ownerId: number;

  /** Branch bds id */
  bdsBranchId: number;
}
