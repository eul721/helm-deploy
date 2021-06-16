import { LocalizedHashmap } from '../../defines/locale';

export interface BranchDescription {
  /** Internal PS id */
  id: number;

  names: LocalizedHashmap;

  passwordProtected: boolean;

  ownerId: number;

  /** Branch bds id */
  bdsBranchId: number;
}
