import { GroupDescription } from './groupdescription';

/**
 * @apiDefine UserDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {String} name Name of the user
 * @apiSuccess (200) {Group[]} groups Groups this user belongs to
 */
export interface UserDescription {
  // Internal PS id
  id: number;

  // Name of the user
  name: string;

  // Groups this user belongs to
  groups?: GroupDescription[];
}

/**
 * @apiDefine UserResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {User[]} items Array of UserDescription
 * @apiSuccess (200) {Number} items.id Internal PS id
 * @apiSuccess (200) {String} items.name Name of the user
 * @apiSuccess (200) {Group[]} items.groups Groups this user belongs to
 */
export interface UserResponse {
  items: UserDescription[];
}
