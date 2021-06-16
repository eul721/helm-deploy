import { LocalizedHashmap } from '../../defines/locale';

/**
 * Describes an RBAC game
 */
export interface GameDescription {
  /** Internal PS id */
  id: number;

  /** Game id */
  contentfulId: string | null;

  /** Owning division id */
  divisionId: number;

  /** Game bds id */
  bdsTitleId: number;

  /** Internal PS id of the default branch */
  defaultBranch: number | null;

  /** Localized name entries */
  names: LocalizedHashmap;
}
