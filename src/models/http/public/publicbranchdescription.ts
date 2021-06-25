import { LocalizedHashmap } from '../../../utils/language';
import { PublicBuildDescription } from './publicbuilddescription';

/**
 * @apiDefine PublicBranchDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {Hashmap} names Map of locale to name
 * @apiSuccess (200) {Boolean} passwordProtected Whether the branch is password protected or not
 * @apiSuccess (200) {Number} ownerId Id of the owning game
 * @apiSuccess (200) {Number} bdsBranchId Branch bds id
 * @apiSuccess (200) {Build[]} versions Version history of this branch
 */
export interface PublicBranchDescription {
  // Internal PS id
  id: number;

  // Map of locale to name
  names: LocalizedHashmap;

  // Whether the branch is password protected or not
  passwordProtected: boolean;

  // Id of the owning game
  ownerId: number;

  // Branch bds id
  bdsBranchId: number;

  // Version history of this branch
  versions?: PublicBuildDescription[];
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
 * @apiSuccess (200) {Build[]} items.versions Version history of this branch
 */
export interface PublicBranchResponse {
  items: PublicBranchDescription[];
}
