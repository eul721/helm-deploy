import { getDBInstance } from '../../models/db/database';
import { DivisionModel } from '../../models/db/division';
import { SampleDatabase } from '../testutils';

describe('src/models/division', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await DivisionModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(DivisionModel.prototype.createGame).toBeDefined();
      expect(DivisionModel.prototype.removeGame).toBeDefined();
      expect(DivisionModel.prototype.getGames).toBeDefined();

      expect(DivisionModel.prototype.createUser).toBeDefined();
      expect(DivisionModel.prototype.removeUser).toBeDefined();
      expect(DivisionModel.prototype.getUsers).toBeDefined();

      expect(DivisionModel.prototype.createGroup).toBeDefined();
      expect(DivisionModel.prototype.removeGroup).toBeDefined();
      expect(DivisionModel.prototype.getGroups).toBeDefined();

      expect(DivisionModel.prototype.createRole).toBeDefined();
      expect(DivisionModel.prototype.removeRole).toBeDefined();
      expect(DivisionModel.prototype.getRoles).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await DivisionModel.findOne({
        where: { id: testDb.division?.id },
        include: [
          DivisionModel.associations.games,
          DivisionModel.associations.users,
          DivisionModel.associations.groups,
          DivisionModel.associations.roles,
        ],
      });
      expect(modelWithAssociations?.games?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.users?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.groups?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.roles?.length).toBeGreaterThan(0);
    });
  });
});
