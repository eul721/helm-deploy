import { getDBInstance } from '../../models/db/database';
import { GameModel } from '../../models/db/game';
import { SampleDatabase } from '../testutils';

describe('src/models/game', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await GameModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(GameModel.prototype.createBuild).toBeDefined();
      expect(GameModel.prototype.removeBuild).toBeDefined();
      expect(GameModel.prototype.getBuilds).toBeDefined();

      expect(GameModel.prototype.createBranch).toBeDefined();
      expect(GameModel.prototype.removeBranch).toBeDefined();
      expect(GameModel.prototype.getBranches).toBeDefined();

      expect(GameModel.prototype.getOwner).toBeDefined();

      expect(GameModel.prototype.createRolesWithGame).toBeDefined();
      expect(GameModel.prototype.removeRolesWithGame).toBeDefined();
      expect(GameModel.prototype.getRolesWithGame).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await GameModel.findOne({
        where: { id: testDb.gameCiv6?.id },
        include: [
          GameModel.associations.builds,
          GameModel.associations.branches,
          GameModel.associations.owner,
          GameModel.associations.rolesWithGame,
        ],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();

      expect(modelWithAssociations?.builds?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.branches?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.rolesWithGame?.length).toBeGreaterThan(0);
    });
  });
});
