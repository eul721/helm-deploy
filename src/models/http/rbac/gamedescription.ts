/**
 * @apiDefine PublisherGameModel Game Description Model
 *  REST response model for Publisher APIs
 *
 * @apiVersion 0.0.1
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {Agreement[]} agreements Array of Agreement objects that belong to this game
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {Branch[]} branches Array of Branch objects that belong to this game
 * @apiSuccess (200) {Build[]} builds Array of Build objects that belong to this game
 * @apiSuccess (200) {String} items.reatedAt ISO 8601 timestamp representing when this item was created
 * @apiSuccess (200) {String} contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} defaultBranchId Branch ID of the default branch
 * @apiSuccess (200) {Number} divisionId Division ID to which this game belongs
 * @apiSuccess (200) {Number} id Unique ID of this title
 * @apiSuccess (200) {Object} names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {String} updatedAt ISO 8601 timestamp representing when this item was last updated
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "agreements": [{Agreement Model}]
 *   "bdsTitleId": 1000000,
 *   "branches": [{Branch Model}],
 *   "builds": [{Build Model}]
 *   "contentfulId": "6sAfVxoGuShx9DV38DcFxI",
 *   "createdAt": "2021-06-22T23:44:59.000Z",
 *   "defaultBranchId": 200000,
 *   "divisionId": 2,
 *   "id": 100000,
 *   "names": {
 *     "en": "XCOM 2 Super Game",
 *     "fi": "XCOM 2 Superpeli"
 *   },
 *   "updatedAt": "2021-06-22T23:45:59.000Z"
 * }
 */
/**
 * @apiDefine PublisherGameModelsArray Array of Game Description Models
 *  REST response model for Publisher APIs
 *
 * @apiVersion 0.0.1
 * @apiSuccess (200) {Game[]} items List of Game Descriptions
 * @apiSuccess (200) {Number} items.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {Agreement[]} items.agreements Array of Agreement objects that belong to this game
 * @apiSuccess (200) {Branch[]} items.branches Array of Branch objects that belong to this game
 * @apiSuccess (200) {Build[]} items.builds Array of Build objects that belong to this game
 * @apiSuccess (200) {String} items.createdAt ISO 8601 timestamp representing when this item was created
 * @apiSuccess (200) {String} items.updatedAt ISO 8601 timestamp representing when this item was last updated
 * @apiSuccess (200) {String} items.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} items.defaultBranchId Branch ID of the default branch
 * @apiSuccess (200) {Number} items.divisionId Division ID to which this game belongs
 * @apiSuccess (200) {Number} items.id Unique ID of this title
 * @apiSuccess (200) {Object} items.names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {String} items.updatedAt ISO 8601 timestamp representing when this item was last updated
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "page": {
 *      "from": 0,
 *      "size": 2,
 *      "sort": "id",
 *      "total": 5
 *   },
 *   "items": [
 *   {
 *     "agreements": [{Agreement Model}]
 *     "bdsTitleId": 1000000,
 *     "branches": [{Branch Model}],
 *     "builds": [{Build Model}]
 *     "createdAt": "2021-06-22T23:44:59.000Z",
 *     "updatedAt": "2021-06-22T23:45:59.000Z",
 *     "contentfulId": "6sAfVxoGuShx9DV38DcFxI",
 *     "defaultBranchId": 200000,
 *     "divisionId": 2,
 *     "id": 100000,
 *     "names": {
 *       "en": "XCOM 2 Super Game",
 *       "fi": "XCOM 2 Superpeli"
 *     },
 *     "updatedAt": "2021-06-22T23:45:59.000Z"
 *   },
 *   {
 *     "agreements": [{Agreement Model}]
 *     "bdsTitleId": 1000001,
 *     "branches": [{Branch Model}],
 *     "builds": [{Build Model}]
 *     "contentfulId": "5Apf8DiUW6dVyqmwjytKzf",
 *     "createdAt": "2021-06-22T23:44:59.000Z",
 *     "defaultBranchId": 200002,
 *     "divisionId": 2,
 *     "id": 100001,
 *     "names": {}
 *     "updatedAt": "2021-06-22T23:45:59.000Z"
 *   }
 *   ]
 * }
 */

import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { LocalizedHashmap } from '../../../utils/language';
import { BranchDescription } from './branchdescription';
import { BuildDescription } from '../resources/builddescription';
import { AgreementDescription } from '../resources/agreementdescription';

/**
 * Describes an RBAC (private Publisher) game model
 */
export interface GameDescription {
  /** Internal PS id */
  id: number;

  agreements: AgreementDescription[];

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

  /** TODO: Mocked for now, need to implement status as a field on game model */
  status: 'draft';

  createdAt: unknown;

  updatedAt: unknown;
}
