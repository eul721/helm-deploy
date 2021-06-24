import { PermissionType } from '../../db/permission';

/**
 * @apiDefine PermissionDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {String} name Name of the permission
 */
export interface PermissionDescription {
  // Name of the permission
  id: PermissionType;
}

/**
 * @apiDefine PermissionResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Permission[]} items Array of PermissionDescription
 * @apiSuccess (200) {String} items.name Name of the permission
 */
export interface PermissionResponse {
  items: PermissionDescription[];
}
