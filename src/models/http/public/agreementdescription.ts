import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine AgreementDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {Object} names Map of locale to name
 * @apiSuccess (200) {Object} urls Map of locale to url
 */

/**
 * @apiDefine AgreementDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Agreement[]} - Array of AgreementDescription
 * @apiSuccess (200) {Number} -.id Internal PS id
 * @apiSuccess (200) {Object} -.names Map of locale to name
 * @apiSuccess (200) {Object} -.urls Map of locale to url
 */

export interface AgreementDescription {
  id: number;

  names: LocalizedHashmap;

  urls: LocalizedHashmap;
}
