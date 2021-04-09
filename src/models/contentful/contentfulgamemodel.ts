import { ContentfulAgreement } from './contentfulagreement';
import { ContentfulPrerequisite } from './contentfulprerequisite';

/**
 * Contentful model representing a single game
 */
export interface ContentfulGameModel {
  parentId: string | null;
  childIds: string[];
  supportedLanguages: string[];
  agreements: ContentfulAgreement[];
  prerequisites: ContentfulPrerequisite[];
  publicReleaseBranch: string | null;
}
