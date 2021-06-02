/**
 * Describes an agreement/eula
 */
export interface AgreementDescription {
  /** Internal PS id */
  id: number;

  /** Url to the full text */
  url: string;

  /** Localized names */
  names?: Record<string, string>;
}
