import { getDBInstance } from '../../db/database';
import { GameModel } from '../../db/game';
import { HttpCode } from '../../http/httpcode';
import { GameService } from '../../../services/gameservice';

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
      GameModel.create({ bdsTitleId, contentfulId });
    });

    it('should return a newly created Game', async () => {
      const result = await GameService.getAllGames();
      expect(result.code).toBe(HttpCode.OK);
      expect(result.payload?.items).toHaveLength(1);
    });
  });
});
