/**
 * HTTP model representing a single required agreement for a games
 * Currently overlaps completely with its contentful equivalent but this may change
 */
export interface Agreement {
  // uid for agreement
  id: string;

  // All titles of all locales in a hashmap
  titles?: Record<string, string>;

  // All localized external urls to the full text of the agreement in a hashmap
  urls?: Record<string, string>;
}
