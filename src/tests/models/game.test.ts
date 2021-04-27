import { getDBInstance } from '../../models/db/database';
import { GameModel } from '../../models/db/game';

describe('src/models/game', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  it('should initialize correctly', async () => {
    const firstResult = await GameModel.findAll();
    expect(firstResult).toHaveLength(0);
    await GameModel.create({
      contentfulId: 'test12345',
      bdsTitleId: 1234,
    });
    const secondResult = await GameModel.findAll();
    expect(secondResult).toHaveLength(1);
  });
});
