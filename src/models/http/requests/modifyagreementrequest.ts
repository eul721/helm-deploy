import { Locale } from '../../../utils/language';

export interface ModifyAgreementRequest {
  // localized name entries
  names: { key: Locale; value: string | null }[];

  // localized url entries
  urls: { key: Locale; value: string | null }[];
}
