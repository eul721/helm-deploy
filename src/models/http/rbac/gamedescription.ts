/**
 * Describes an RBAC game
 */
export interface GameDescription {
  /** Internal PS id */
  id: number;

  /** Game id */
  contentfulId: string;

  /** Owning division id */
  divisionId: number;

  /** Game bds id */
  bdsTitleId: number;
}
