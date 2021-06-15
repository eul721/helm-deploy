/**
 * Describes an agreement/eula
 */
export interface AgreementDescription {
  /** Internal PS id */
  id: number;

  // localized name entries
  names: Record<string, string>;

  // localized url entries
  urls: Record<string, string>;
}
