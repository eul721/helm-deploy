import { ContentfulPatchModel } from '../contentful/contentfulpatchmodel';

export interface Version extends ContentfulPatchModel {
  buildId: number;
}
