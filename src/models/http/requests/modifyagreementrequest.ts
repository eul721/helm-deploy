import { HashmapChangeRequest } from '../../../utils/language';

export interface ModifyAgreementRequest {
  // localized name entries
  names: HashmapChangeRequest;

  // localized url entries
  urls: HashmapChangeRequest;
}
