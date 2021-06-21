import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublicBuildDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Object} releaseNotes Map of locale to release notes
 * @apiSuccess (200) {Boolean} mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */

/**
 * @apiDefine PublicBuildDescriptionArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Build[]} - Array of PublicBuildDescription
 * @apiSuccess (200) {Object} -.releaseNotes Map of locale to release notes
 * @apiSuccess (200) {Boolean} -.mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */

export interface PublicBuildDescription {
  patchNotes: LocalizedHashmap;

  mandatory: boolean;
}
