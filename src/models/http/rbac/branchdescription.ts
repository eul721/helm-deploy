/**
 * @apiDefine PublisherBranchModel Branch Description Model
 *  REST response model for Publisher APIs
 *
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} bdsBranchId Unique ID of branch in BDS
 * @apiSuccess (200) {Number} id Unique ID of this branch
 * @apiSuccess (200) {Object} names Hashmap of localized names for this branch
 * @apiSuccess (200) {Number} ownerId Owner ID of this resource
 * @apiSuccess (200) {String} password Password for this branch (null if not defined)
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

import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublisherBranchModelArray Array of Branch Description Models
 *  REST response model for Publisher APIs
 *
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Branch[]} - List of Branch Descriptions. This response is an array of Branch Models.
 * @apiSuccess (200) {Number} -.bdsBranchId Unique ID of branch in BDS
 * @apiSuccess (200) {Number} -.id Unique ID of this branch
 * @apiSuccess (200) {Object} -.names Hashmap of localized names for this branch
 * @apiSuccess (200) {Number} -.ownerId Owner ID of this resource
 * @apiSuccess (200) {String} -.password Password for this branch (null if not defined)
 *
 * @apiSuccessExample {json} Success-Response:
 *  [
 *    {
 *      "bdsBranchId": 4000000,
 *      "id": 200000,
 *      "names": {},
 *      "ownerId": 100000,
 *      "password": null
 *    },
 *    {
 *      "bdsBranchId": 4444444,
 *      "id": 200001,
 *      "names": {},
 *      "ownerId": 100000,
 *      "password": null
 *    }
 *  ]
 */

/**
 * Describes an RBAC (private Publisher) branch model
 */
export interface BranchDescription {
  /** Branch bds id */
  bdsBranchId: number;

  /** Internal PS id */
  id: number;

  names: LocalizedHashmap;

  ownerId: number;

  password?: string;
}
