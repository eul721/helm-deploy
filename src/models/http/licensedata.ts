import { HttpCode } from './httpcode';

export interface LicenseData {
  dnaCode?: number;
  status: HttpCode;
  licenses: string[];
}
