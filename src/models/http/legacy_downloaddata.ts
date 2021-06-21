import { LocalizedHashmap } from '../../utils/language';

export interface LegacyDownloadDataRoot {
  model: Model;
}

// the key is the contentful id
export interface Model {
  downloadData: { [key: string]: LegacyDownloadData };
}

export interface LegacyDownloadData {
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
