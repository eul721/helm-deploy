import { getDBInstance } from './database';
import { Game } from './game';

describe('src/models/game', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  it('should initialize correctly', async () => {
    const firstResult = await Game.findAll();
    expect(firstResult).toHaveLength(0);
    await Game.create({
      contentfulId: 'test12345',
      titleId: 'testtitle',
    });
    const secondResult = await Game.findAll();
    expect(secondResult).toHaveLength(1);
  });
});
