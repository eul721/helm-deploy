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
export interface GroupDescription {
  // Internal PS id
  id: number;

  // Name of the group
  name: string;

  // Owning division id
  divisionId: number;

  // Roles assigned to this group, set if present in db model during mapping
  roles?: RoleDescription[];

  // Users who belong to this group, set if present in db model during mapping
  users?: UserDescription[];
}

/**
 * @apiDefine GroupResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Group[]} items Array of GroupDescription
 * @apiSuccess (200) {Number} items.id Internal PS id
 * @apiSuccess (200) {String} items.name Name of the group
 * @apiSuccess (200) {Number} items.divisionId Owning division id
 * @apiSuccess (200) {Role[]} items.roles Roles assigned to this group, set if present in db model during mapping
 * @apiSuccess (200) {User[]} items.users Users who belong to this group, set if present in db model during mapping
 */
export interface GroupResponse {
  items: GroupDescription[];
}
