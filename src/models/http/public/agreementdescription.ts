import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine AgreementDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {Hashmap} names Map of locale to name
 * @apiSuccess (200) {Hashmap} urls Map of locale to url
 */
export interface AgreementDescription {
  // Internal PS id
  id: number;

  // Map of locale to name
  names: LocalizedHashmap;

  // Map of locale to url
  urls: LocalizedHashmap;
}

/**
 * @apiDefine AgreementResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Agreement[]} items Array of AgreementDescription
 * @apiSuccess (200) {Number} items.id Internal PS id
 * @apiSuccess (200) {Hashmap} items.names Map of locale to name
 * @apiSuccess (200) {Hashmap} items.urls Map of locale to url
 */
export interface AgreementResponse {
  items: AgreementDescription[];
}
