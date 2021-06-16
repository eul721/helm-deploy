import { LocalizedHashmap } from '../defines/locale';

export interface DownloadDataRoot {
  model: Model;
}

// the key is the contentful id
export interface Model {
  downloadData: { [key: string]: DownloadData };
}

export interface DownloadData {
  names?: LocalizedHashmap;
  titleId: number;
  branchId: number;
  versions: {
    buildId: number;
    releaseNotes?: string;
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
