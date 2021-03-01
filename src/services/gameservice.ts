import { warn } from '../logger';
import { Game } from '../models/game';

/**
 * Creates a Game in the Publisher Services
 *
 * @param titleId BDS titleId this game will reference
 * @param contentfulId Contentful space ID to join localized data
 */
export async function createGame(titleId: number, contentfulId: string): Promise<Game> {
  const params = {
    titleId,
    contentfulId,
  };
  // TODO: Validation will go here
  try {
    const newRecord = await Game.create(params);
    return newRecord;
  } catch (sqlErr) {
    warn('Encountered error creating record with params=%j, error=%s', params, sqlErr);
    throw new Error('Bad Request');
  }
}
