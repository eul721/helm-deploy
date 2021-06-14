import { Locale } from '../db/localizedfield';

/**
 * An object describing a single language EULA entry
 * This class should match eulaEntry from BDS swagger
 *
 */
export interface EulaEntry {
  /** Locale */
  locale: Locale;

  /** Name of the EULA in given locale */
  name: string;

  /** Url to the full EULA in given locale */
  url: string;
}
