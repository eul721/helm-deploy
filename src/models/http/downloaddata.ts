import { Agreement } from './agreement';
import { Prerequisite } from './prerequisite';
import { Version } from './versionmodel';

export interface DownloadDataRoot {
  model: Model;
}

// the key is the contentful id
export interface Model {
  downloadData: { [key: string]: DownloadData };
}

export interface DownloadData {
  name: string;
  titleId: number;
  branchId: number;
  versions: Version[];
  agreements: Agreement[];
  prerequisites: Prerequisite[];
  supportedLanguages: string[];
}
