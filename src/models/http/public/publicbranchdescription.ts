import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublicBranchDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {Hashmap} names Map of locale to name
 * @apiSuccess (200) {Boolean} passwordProtected Whether the branch is password protected or not
 * @apiSuccess (200) {Number} ownerId Id of the owning game
 * @apiSuccess (200) {Number} bdsBranchId Branch bds id
 */
export interface PublicBranchDescription {
  id: number;

  names: LocalizedHashmap;

  passwordProtected: boolean;

  ownerId: number;

  bdsBranchId: number;
}

/**
 * @apiDefine PublicBranchResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Branch[]} items Array of BranchDescription
 * @apiSuccess (200) {Number} items.id Internal PS id
 * @apiSuccess (200) {Hashmap} items.names Map of locale to name
 * @apiSuccess (200) {Boolean} items.passwordProtected Whether the branch is password protected or not
 * @apiSuccess (200) {Number} items.ownerId Id of the owning game
 * @apiSuccess (200) {Number} items.bdsBranchId Branch bds id
 */
export interface PublicBranchResponse {
  items: PublicBranchDescription[];
}
