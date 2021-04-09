import { getDBInstance } from '../models/db/database';
import { GameModel } from '../models/db/game';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from './gameservice';

describe('src/service/gameservice', () => {
  let contentfulId: string;
  let bdsTitleId: number;

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  describe('with valid input', () => {
    beforeEach(() => {
      contentfulId = 'abcd12345';
      bdsTitleId = 123456;
      GameModel.createEntry({ bdsTitleId, contentfulId });
    });

    it('should return a newly created Game', async () => {
      const result = await GameService.getAllGames();
      expect(result.code).toBe(HttpCode.OK);
      expect(result.payload?.items).toHaveLength(1);
    });
  });
});
