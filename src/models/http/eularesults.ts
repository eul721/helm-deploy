import { EulaEntry } from './eulaentry';

/**
 * An object describing EULA of a title
 * This class should match eulaResults from BDS swagger
 */
export interface EulaResults {
  // EULA id
  id: number;

  // localized entries
  entries: EulaEntry[];
}
