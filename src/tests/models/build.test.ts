import { BuildModel } from '../../models/db/build';
import { getDBInstance } from '../../models/db/database';
import { SampleDatabase } from '../../utils/sampledatabase';

describe('src/models/build', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await BuildModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(BuildModel.prototype.createBranch).toBeDefined();
      expect(BuildModel.prototype.removeBranch).toBeDefined();
      expect(BuildModel.prototype.getBranches).toBeDefined();
      expect(BuildModel.prototype.getOwner).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await BuildModel.findOne({
        where: { id: testDb.civ6Build1.id },
        include: [BuildModel.associations.owner, BuildModel.associations.branches],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();
      expect(modelWithAssociations?.branches?.length).toBeGreaterThan(0);
    });
  });
});
