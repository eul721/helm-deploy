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
/**
 * @apiDefine PublisherGameModelsArray Array of Game Description Models
 *  REST response model for Publisher APIs
 *
 * @apiVersion 0.0.1
 * @apiSuccess (200) {Game[]} - List of Game Descriptions. This response is an array of Game Models
 * @apiSuccess (200) {Number} -.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {Branch[]} -.branches Array of Branch objects that belong to this game
 * @apiSuccess (200) {Build[]} -.builds Array of Build objects that belong to this game
 * @apiSuccess (200) {String} -.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} -.defaultBranchId Branch ID of the default branch
 * @apiSuccess (200) {Number} -.divisionId Division ID to which this game belongs
 * @apiSuccess (200) {Number} -.id Unique ID of this title
 * @apiSuccess (200) {Object} -.names Hashmap of names for this game, keyed by Locale
 *
 * @apiSuccessExample {json} Success-Response:
 * [
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
 * },
 * {
 *   "bdsTitleId": 1000001,
 *   "branches": [{Branch Model}],
 *   "builds": [{Build Model}]
 *   "contentfulId": "5Apf8DiUW6dVyqmwjytKzf",
 *   "defaultBranchId": 200002,
 *   "divisionId": 2,
 *   "id": 100001,
 *   "names": {}
 * }
 * ]
 */

import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { LocalizedHashmap } from '../../../utils/language';
import { BranchDescription } from './branchdescription';
import { BuildDescription } from '../resources/builddescription';

/**
 * Describes an RBAC (private Publisher) game model
 */
export interface GameDescription {
  /** Internal PS id */
  id: number;

  branches: BranchDescription[];

  builds: BuildDescription[];

  /** Game id */
  contentfulId: Maybe<string>;

  /** Default branch ID */
  defaultBranchId: Maybe<number>;

  /** Owning division id */
  divisionId: number;

  /** Game bds id */
  bdsTitleId: number;

  /** Game names */
  names: LocalizedHashmap;
}
