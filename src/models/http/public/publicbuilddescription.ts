import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublicBuildDescription
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Hashmap} releaseNotes Map of locale to release notes
 * @apiSuccess (200) {Boolean} mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */
export interface PublicBuildDescription {
  // Map of locale to release notes
  patchNotes: LocalizedHashmap;

  // Whether the update is mandatory and the game should not be allowed to start without getting it
  mandatory: boolean;
}

/**
 * @apiDefine PublicBuildResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Build[]} items Array of PublicBuildDescription
 * @apiSuccess (200) {Hashmap} items.releaseNotes Map of locale to release notes
 * @apiSuccess (200) {Boolean} items.mandatory Whether the update is mandatory and the game should not be allowed to start without getting it
 */
export interface PublicBuildResponse {
  items: PublicBuildDescription[];
}
