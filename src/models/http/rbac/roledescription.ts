import { PermissionType } from '../../db/permission';
import { PublisherGameDescription } from './publishergamedescription';

/**
 * @apiDefine RoleDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {String} name Name of the role
 * @apiSuccess (200) {Permission[]} assignedPermissions Permissions of this role
 * @apiSuccess (200) {Game[]} assignedGames Games this role affects
 */
export interface RoleDescription {
  // Internal PS id
  id: number;

  // Name of the role
  name: string;

  // Permissions of this role
  assignedPermissions?: PermissionType[];

  // Games this role affects
  assignedGames?: PublisherGameDescription[];
}

/**
 * @apiDefine RoleResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Role[]} items Array of RoleDescription
 * @apiSuccess (200) {Number} items.id Internal PS id
 * @apiSuccess (200) {String} items.name Name of the user
 * @apiSuccess (200) {Permission[]} items.assignedPermissions Permissions of this role
 * @apiSuccess (200) {Game[]} items.assignedGames Games this role affects
 */
export interface RoleResponse {
  items: RoleDescription[];
}
