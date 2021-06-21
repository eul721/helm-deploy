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
 * @apiSuccess (200) {Object} names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {Branch} branch Description of the requested (default if not specified) branch
 * @apiSuccess (200) {Build[]} versions Versions (builds) history of the selected branch
 * @apiSuccess (200) {Agreement[]} agreements Agreements required to access this title
 * @apiSuccess (200) {String[]} supportedLanguages Array of supported languages
 */

/**
 * @apiDefine DownloadDataArray
 * @apiVersion 0.0.1
 *
 * @apiSuccess (200) {DownloadData[]} - Array of DownloadData
 * @apiSuccess (200) {Number} -.bdsTitleId Unique ID of title in BDS
 * @apiSuccess (200) {String} -.contentfulId Contentful ID of this game, if it is set
 * @apiSuccess (200) {Number} -.id Unique ID of this title
 * @apiSuccess (200) {Object} -.names Hashmap of names for this game, keyed by Locale
 * @apiSuccess (200) {Branch} -.branch Description of the requested (default if not specified) branch
 * @apiSuccess (200) {Build[]} -.versions Versions (builds) history of the selected branch
 * @apiSuccess (200) {Agreement[]} -.agreements Agreements required to access this title
 * @apiSuccess (200) {String[]} -.supportedLanguages Array of supported languages
 */

export interface DownloadData extends PublicGameDescription {
  branch: PublicBranchDescription;

  versions: PublicBuildDescription[];

  agreements: AgreementDescription[];

  supportedLanguages: string[];
}
