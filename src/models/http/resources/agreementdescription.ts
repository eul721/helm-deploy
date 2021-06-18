import { LocalizedHashmap } from '../../../utils/language';

/**
 * Describes an agreement/eula
 */
export interface AgreementDescription {
  /** Internal PS id */
  id: number;

  // localized name entries
  names: LocalizedHashmap;

  // localized url entries
  urls: LocalizedHashmap;
}
