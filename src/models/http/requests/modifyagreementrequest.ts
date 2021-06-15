import { Locale } from '../../db/localizedfield';

export interface ModifyAgreementRequest {
  // localized name entries
  names: { key: Locale; value: string }[];

  // localized url entries
  urls: { key: Locale; value: string }[];
}
