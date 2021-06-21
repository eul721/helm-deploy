import { GroupDescription } from './groupdescription';

/**
 * @apiDefine UserDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {String} name Name of the user
 * @apiSuccess (200) {Group[]} groups Groups this user belongs to
 */

/**
 * @apiDefine UserDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {User[]} - Array of UserDescription
 * @apiSuccess (200) {Number} -.id Internal PS id
 * @apiSuccess (200) {String} -.name Name of the user
 * @apiSuccess (200) {Group[]} -.groups Groups this user belongs to
 */

export interface UserDescription {
  id: number;

  name: string;

  groups?: GroupDescription[];
}
