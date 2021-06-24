import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublisherBranchDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Unique ID of this branch in PS
 * @apiSuccess (200) {Number} bdsBranchId Unique ID of this branch in BDS
 * @apiSuccess (200) {Hashmap} names Hashmap of localized names for this branch
 * @apiSuccess (200) {Number} ownerId Owner PS ID of this resource
 * @apiSuccess (200) {String} password Password for this branch (empty string if not defined)
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "bdsBranchId": 4000047,
 *    "id": 200004,
 *    "names": {},
 *    "ownerId": 100003,
 *    "password": null
 *  }
 */

export interface PublisherBranchDescription {
  // Unique ID of this branch in PS
  id: number;

  // Unique ID of this branch in BDS
  bdsBranchId: number;

  // Hashmap of localized names for this branch
  names: LocalizedHashmap;

  // Owner PS ID of this resource
  ownerId: number;

  // Password for this branch (null if not defined)
  password?: string;
}

/**
 * @apiDefine PublisherBranchResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Branch[]} items Array of Branches
 * @apiSuccess (200) {Number} items.id Unique ID of this branch
 * @apiSuccess (200) {Number} items.bdsBranchId Unique ID of this branch in BDS
 * @apiSuccess (200) {Hashmap} items.names Hashmap of localized names for this branch
 * @apiSuccess (200) {Number} items.ownerId Owner PS ID of this resource
 * @apiSuccess (200) {String} items.password Password for this branch (empty string if not defined)
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   items:
 *   [
 *     {
 *       "bdsBranchId": 4000000,
 *       "id": 200000,
 *       "names": {},
 *       "ownerId": 100000,
 *       "password": null
 *     },
 *     {
 *       "bdsBranchId": 4444444,
 *       "id": 200001,
 *       "names": {},
 *       "ownerId": 100000,
 *       "password": null
 *     }
 *   ]
 */
export interface PublisherBranchResponse {
  items: PublisherBranchDescription[];
}
