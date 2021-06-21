import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublicGameDescription Public Game Description Model
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} id Unique ID of this title
 * @apiSuccess (200) {Object} names Hashmap of names for this game, keyed by Locale
 */

/**
 * @apiDefine PublicGameDescriptionArray Array of Game Description Models
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Object[]} - List of Game Descriptions. This response is an array of Game Models
 * @apiSuccess (200) {Number} -.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} -.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} -.id Unique ID of this title
 * @apiSuccess (200) {Object} -.names Hashmap of names for this game, keyed by Locale
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *  {
 *   "bdsTitleId": 1000000,
 *   "contentfulId": "6sAfVxoGuShx9DV38DcFxI",
 *   "id": 100000,
 *   "names": {
 *    "en": "Super Game",
 *    "fi": "Superpeli"
 *   }
 *  },
 *  {
 *   "bdsTitleId": 1000001,
 *   "contentfulId": "5Apf8DiUW6dVyqmwjytKzf",
 *   "id": 100001,
 *   "names": {}
 *  }
 * ]
 */

export interface PublicGameDescription {
  id: number;

  contentfulId: string;

  bdsTitleId: number;

  names: LocalizedHashmap;
}
