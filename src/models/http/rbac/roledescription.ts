import { PermissionType } from '../../db/permission';
import { GameDescription } from './gamedescription';

/**
 * @apiDefine RoleDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {String} name Name of the role
 * @apiSuccess (200) {Permission[]} assignedPermissions Permissions of this role
 * @apiSuccess (200) {Game[]} assignedGames Games this role affects
 */

/**
 * @apiDefine RoleDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Role[]} - Array of RoleDescription
 * @apiSuccess (200) {Number} -.id Internal PS id
 * @apiSuccess (200) {String} -.name Name of the user
 * @apiSuccess (200) {Permission[]} -.assignedPermissions Permissions of this role
 * @apiSuccess (200) {Game[]} -.assignedGames Games this role affects
 */

export interface RoleDescription {
  id: number;

  name: string;

  assignedPermissions?: PermissionType[];

  assignedGames?: GameDescription[];
}
