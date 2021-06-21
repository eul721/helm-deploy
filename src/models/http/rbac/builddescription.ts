import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublisherBuildDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200)  {Number} id Internal PS id
 * @apiSuccess (200) {Number} ownerId Id of the owning game
 * @apiSuccess (200) {Number} bdsBuildId Build bds id
 * @apiSuccess (200) {Object} releaseNotes Map of locale to release notes
 * @apiSuccess (200) {Boolean} mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */

/**
 * @apiDefine PublisherBuildDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Build[]} - Array of BuildDescription
 * @apiSuccess (200) {Number} -.id Internal PS id
 * @apiSuccess (200) {Number} -.ownerId Id of the owning game
 * @apiSuccess (200) {Number} -.bdsBuildId Build bds id
 * @apiSuccess (200) {Object} -.releaseNotes Map of locale to release notes
 * @apiSuccess (200) {Boolean} -.mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */

export interface BuildDescription {
  id: number;

  ownerId: number;

  bdsBuildId: number;

  patchNotes: LocalizedHashmap;

  mandatory: boolean;
}
