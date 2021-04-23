/**
 * Contentful model representing a single required agreement for a games
 */
export interface ContentfulAgreement {
  // human-readable agreement title
  title: string;

  // external url to the full text of the agreement
  url: string;

  // todo: find out what it is
  isEmbed: boolean;
}
