import { ContentfulAgreement } from './contentfulagreement';
import { ContentfulPrerequisite } from './contentfulprerequisite';

/**
 * Contentful model representing a single game
 */
export interface ContentfulGameModel {
  // human-readable game name
  name: string;

  // parent game id IF this is a DLC, null otherwise
  parentId: string | null;

  // child DLC ids, if this is a full game and has those set
  childIds: string[];

  // list of languages supported by this game/dlc
  supportedLanguages: string[];

  // legal agreements that need to be accepted to access this game/dlc
  agreements: ContentfulAgreement[];

  // prerequisites that need to be added during install
  prerequisites: ContentfulPrerequisite[];

  // default branch that players will download unless they explicitly change it, this should be set when a game goes live
  publicReleaseBranch: string | null;
}
