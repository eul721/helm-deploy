/**
 * Contentful model representing a game branch
 */
export interface ContentfulBranchModel {
  // human-readable branch name
  name: string;

  // optional password required to get this branch, for example for an invite-only beta
  password: string | null;

  // branches that are marked isPublic will be accessible to end users (eg: 'beta', 'experimental', 'main', etc)", other ones will only be available to studio-users
  isPublic: boolean;
}
