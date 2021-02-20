import { sequelize } from './database';
import { Branch } from './branch';
import { Build } from './build';
import { Game } from './game';

describe('src/models/database', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true, match: /_test$/ });
  });

  it('should initialize the database', async () => {
    await expect(async () => sequelize.sync()).not.toThrow();
  });

  describe('when accessing Games', () => {
    it('should enable writing of Game models', async () => {
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

  describe('when accessing Builds', () => {
    it('should enable writing of Build models', async () => {
      const firstResult = await Build.findAll();
      expect(firstResult).toHaveLength(0);
      await Build.create({
        contentfulId: 'test12345',
        buildId: 'testtitle',
      });
      const secondResult = await Build.findAll();
      expect(secondResult).toHaveLength(1);
    });
  });

  describe('when accessing Branches', () => {
    it('should enable writing of Build models', async () => {
      const firstResult = await Branch.findAll();
      expect(firstResult).toHaveLength(0);
      await Branch.create();
      const secondResult = await Branch.findAll();
      expect(secondResult).toHaveLength(1);
    });
  });
});
