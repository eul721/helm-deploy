import { LocalizedHashmap } from '../../utils/language';

export interface LEGACY_DownloadDataRoot {
  model: Model;
}

// the key is the contentful id
export interface Model {
  downloadData: { [key: string]: LEGACY_DownloadData };
}

export interface LEGACY_DownloadData {
  names?: LocalizedHashmap;
  titleId: number;
  branchId: number;
  versions: {
    buildId: number;
    releaseNotes: LocalizedHashmap;
    mandatory: boolean;
    version: string;
  }[];
  agreements: {
    id: number;
    urls?: LocalizedHashmap;
    names?: LocalizedHashmap;
  }[];
  supportedLanguages: string[];
}
