import { PermissionType } from '../../db/permission';

/**
 * @apiDefine PermissionDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {String} name Name of the permission
 */

/**
 * @apiDefine PermissionDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Permission[]} - Array of PermissionDescription
 * @apiSuccess (200) {String} -.name Name of the permission
 */

export interface PermissionDescription {
  id: PermissionType;
}
