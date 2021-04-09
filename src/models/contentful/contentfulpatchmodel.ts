/**
 * Contentful model representing a single build/patch
 */
export interface ContentfulPatchModel {
  versionName: string;
  releaseNotes: string;
  mandatory: boolean;
}
