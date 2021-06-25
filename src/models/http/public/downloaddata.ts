import { AgreementDescription } from './agreementdescription';
import { PublicBranchDescription } from './publicbranchdescription';
import { PublicBuildDescription } from './publicbuilddescription';
import { PublicGameDescription } from './publicgamedescription';

/**
 * @apiDefine DownloadData
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {Number} bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} id Unique ID of this title
 * @apiSuccess (200) {Hashmap} names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {Branch} branch Description of the requested (default if not specified) branch
 * @apiSuccess (200) {Build[]} versions Versions (builds) history of the selected branch
 * @apiSuccess (200) {Agreement[]} agreements Agreements required to access this title
 * @apiSuccess (200) {String[]} supportedLanguages Array of supported languages
 * @apiSuccess (200) {String} installDir Installation folder, if not set a default is meant to be used
 */
export interface DownloadData extends PublicGameDescription {
  // Description of the requested (default if not specified) branch
  branch: PublicBranchDescription;

  // Versions (builds) history of the selected branch
  versions: PublicBuildDescription[];

  // Agreements required to access this title
  agreements: AgreementDescription[];

  // Array of supported languages
  supportedLanguages: string[];

  // Installation folder, if not set a default is meant to be used
  installDir: string;
}

/**
 * @apiDefine DownloadDataResponse
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {DownloadData[]} items Array of DownloadData
 * @apiSuccess (200) {Number} items.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} items.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} items.id Unique ID of this title
 * @apiSuccess (200) {Hashmap} items.names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {Branch} items.branch Description of the requested (default if not specified) branch
 * @apiSuccess (200) {Build[]} items.versions Versions (builds) history of the selected branch
 * @apiSuccess (200) {Agreement[]} items.agreements Agreements required to access this title
 * @apiSuccess (200) {String[]} items.supportedLanguages Array of supported languages
 * @apiSuccess (200) {String} items.installDir Installation folder, if not set a default is meant to be used
 */
export interface DownloadDataResponse {
  items: DownloadData[];
}
