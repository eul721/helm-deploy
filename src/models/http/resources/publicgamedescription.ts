import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublicGameModel Public Game Description Model
 *  REST response model for Download APIs
 *
 * @apiVersion 0.0.1
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} divisionId Division ID to which this game belongs
 * @apiSuccess (200) {Number} id Unique ID of this title
 * @apiSuccess (200) {Object} names Hashmap of names for this game, keyed by Locale
 */
/**
 * @apiDefine PublicGameModelsArray Array of Game Description Models
 *  REST response model for Download APIs
 *
 * @apiVersion 0.0.1
 * @apiSuccess (200) {Object[]} - List of Game Descriptions. This response is an array of Game Models
 * @apiSuccess (200) {Number} -.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} -.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} -.divisionId Division ID to which this game belongs
 * @apiSuccess (200) {Number} -.id Unique ID of this title
 * @apiSuccess (200) {Object} -.names Hashmap of names for this game, keyed by Locale
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *  {
 *   "bdsTitleId": 1000000,
 *   "contentfulId": "6sAfVxoGuShx9DV38DcFxI",
 *   "divisionId": 2,
 *   "id": 100000,
 *   "names": {
 *    "en": "Super Game",
 *    "fi": "Superpeli"
 *   }
 *  },
 *  {
 *   "bdsTitleId": 1000001,
 *   "contentfulId": "5Apf8DiUW6dVyqmwjytKzf",
 *   "divisionId": 2,
 *   "id": 100001,
 *   "names": {}
 *  }
 * ]
 */

/**
 * Describes a Download (public Download) game model
 */
export interface PublicGameDescription {
  /** Internal PS id */
  id: number;

  /** Game id */
  contentfulId: string;

  /** Owning division id */
  divisionId: number;

  /** Game bds id */
  bdsTitleId: number;

  /** Game names */
  names: LocalizedHashmap;
}
