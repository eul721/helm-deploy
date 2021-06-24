export interface DnaLicenseResponse {
  licenseBinary: string;
  licenses: {
    referenceId: string; // this is the same as app/contentful id
    expireAt: number;
  }[];
}
