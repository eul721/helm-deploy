/**
 * Contentful model representing a single build/patch
 */
export interface ContentfulPatchModel {
  // human-readable version name of this patch
  version: string;

  // release notes for the patch
  releaseNotes: string;

  // whether the update is mandatory and the game should not be allowed to start without getting it
  mandatory: boolean;

  // todo: find out what it is
  patchArticleSlug: string;
}
