import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublisherGameModel Game Description Model
 *  REST response model for Publisher APIs
 *
 * @apiVersion 0.0.1
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {Branch[]} -.branches Array of Branch objects that belong to this game
 * @apiSuccess (200) {Build[]} -.builds Array of Build objects that belong to this game
 * @apiSuccess (200) {String} contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} defaultBranchId Branch ID of the default branch
 * @apiSuccess (200) {Number} divisionId Division ID to which this game belongs
 * @apiSuccess (200) {Number} id Unique ID of this title
 * @apiSuccess (200) {Object} names Hashmap of names for this game, keyed by Locale
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "bdsTitleId": 1000000,
 *   "branches": [{Branch Model}],
 *   "builds": [{Build Model}]
 *   "contentfulId": "6sAfVxoGuShx9DV38DcFxI",
 *   "defaultBranchId": 200000,
 *   "divisionId": 2,
 *   "id": 100000,
 *   "names": {
 *     "en": "XCOM 2 Super Game",
 *     "fi": "XCOM 2 Superpeli"
 *   }
 * }
 */
export interface GameDescription {
  /** Internal PS id */
  id: number;

  /** Game id */
  contentfulId: string | null;

  /** Owning division id */
  divisionId: number;

  /** Game bds id */
  bdsTitleId: number;

  /** Internal PS id of the default branch */
  defaultBranch: number | null;

  /** Localized name entries */
  names: LocalizedHashmap;
}
