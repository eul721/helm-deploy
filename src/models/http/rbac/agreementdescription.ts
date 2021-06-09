/**
 * Describes an agreement/eula
 */
export interface AgreementDescription {
  /** Internal PS id */
  id: number;

  /** Url to the full text */
  urls?: Record<string, string>;

  /** Localized names */
  names?: Record<string, string>;
}
