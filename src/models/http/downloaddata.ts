import { Agreement } from './agreement';
import { Version } from './versionmodel';

export interface DownloadDataRoot {
  model: Model;
}

// the key is the contentful id
export interface Model {
  downloadData: { [key: string]: DownloadData };
}

export interface DownloadData {
  names?: Record<string, string>;
  titleId: number;
  branchId: number;
  versions: Version[];
  agreements: Agreement[];
  supportedLanguages: string[];
}
