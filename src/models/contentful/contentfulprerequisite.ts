/**
 * Contentful model representing a single prerequisite of a game
 */
export interface ContentfulPrerequisite {
  // human readable name
  title: string;

  // program version
  version: string;

  // todo: find out what it is
  relativePath: string;

  // command line to run the prerequisite installer with
  commandLine: string;

  // specifies if the prerequisite is required or optional
  required: boolean;

  // prerequisite id in bds needed for downloading it
  bdsId: number;
}
