import { RoleDescription } from './roledescription';
import { UserDescription } from './userdescription';

/**
 * @apiDefine GroupDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {String} name Name of the group
 * @apiSuccess (200) {Number} divisionId Owning division id
 * @apiSuccess (200) {Role[]} roles Roles assigned to this group, set if present in db model during mapping
 * @apiSuccess (200) {User[]} users Users who belong to this group, set if present in db model during mapping
 */

/**
 * @apiDefine GroupDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Group[]} - Array of GroupDescription
 * @apiSuccess (200) {Number} -.id Internal PS id
 * @apiSuccess (200) {String} -.name Name of the group
 * @apiSuccess (200) {Number} -.divisionId Owning division id
 * @apiSuccess (200) {Role[]} -.roles Roles assigned to this group, set if present in db model during mapping
 * @apiSuccess (200) {User[]} -.users Users who belong to this group, set if present in db model during mapping
 */

export interface GroupDescription {
  id: number;

  name: string;

  divisionId: number;

  roles?: RoleDescription[];

  users?: UserDescription[];
}
