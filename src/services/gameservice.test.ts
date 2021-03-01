import { getDBInstance } from '../models/database';
import * as GameService from './gameservice';

describe('src/service/gameservice', () => {
  let titleId: number;
  let contentfulId: string;

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  describe('with valid input', () => {
    beforeEach(() => {
      titleId = 12345;
      contentfulId = 'abcd12345';
    });

    it('should return a newly created Game', async () => {
      const result = await GameService.createGame(titleId, contentfulId);
      expect(result).toHaveProperty('id');
    });
  });
});
