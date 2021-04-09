/**
 * Contentful model representing a single prerequisite of a game
 */
export interface ContentfulPrerequisite {
  title: string;
  version: string;
  relativePath: string;
  commandLine: string;
  required: boolean;
  bdsId: number;
}
