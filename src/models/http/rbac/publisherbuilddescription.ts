/**
 * @apiDefine PublisherBuildDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} id Internal PS id
 * @apiSuccess (200) {Number} ownerId PS id of the owning game
 * @apiSuccess (200) {Number} bdsBuildId Build bds id
 * @apiSuccess (200) {String} patchNotesId Resource id of patch notes
 * @apiSuccess (200) {Boolean} mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */
export interface PublisherBuildDescription {
  // Internal PS id
  id: number;

  // PS id of the owning game
  ownerId: number;

  // Build bds id
  bdsBuildId: number;

  // Map of locale to release notes
  patchNotesId?: string;

  // Whether the update is mandatory and the game should not be allowed to start without getting it
  mandatory: boolean;
}

/**
 * @apiDefine PublisherBuildResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Build[]} items Array of PublisherBuildDescription
 * @apiSuccess (200) {Number} items.id Internal PS id
 * @apiSuccess (200) {Number} items.ownerId Id of the owning game
 * @apiSuccess (200) {Number} items.bdsBuildId Build bds id
 * @apiSuccess (200) {String} items.patchNotesId Resource id of patch notes
 * @apiSuccess (200) {Boolean} items.mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */
export interface PublisherBuildResponse {
  items: PublisherBuildDescription[];
}
