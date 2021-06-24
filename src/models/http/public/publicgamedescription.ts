import { LocalizedHashmap } from '../../../utils/language';

/**
 * @apiDefine PublicGameDescription Public Game Description Model
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} id Unique ID of this title
 * @apiSuccess (200) {Hashmap} names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {String} installDir Installation folder, if not set a default is meant to be used
 */
export interface PublicGameDescription {
  // Unique ID of title in BDS
  id: number;

  // Contentful ID of this game, if it is set
  contentfulId: string;

  // Unique ID of this title
  bdsTitleId: number;

  // Hashmap of names for this game, keyed by Locale
  names: LocalizedHashmap;

  // Installation folder, if not set a default is meant to be used
  installDir: string;
}

/**
 * @apiDefine PublicGameResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Game[]} items Array of Game Descriptions
 * @apiSuccess (200) {Number} items.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} items.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} items.id Unique ID of this title
 * @apiSuccess (200) {Hashmap} items.names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {String} items.installDir Installation folder, if not set a default is meant to be used
 */
export interface PublicGameResponse {
  items: PublicGameDescription[];
}
