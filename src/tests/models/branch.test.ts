import { BranchModel } from '../../models/db/branch';
import { getDBInstance } from '../../models/db/database';
import { SampleDatabase } from '../testutils';

describe('src/models/branch', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const numtestDbDefaults = 5;
    const firstResult = await BranchModel.findAll();
    expect(firstResult).toHaveLength(numtestDbDefaults);
    await BranchModel.create({ bdsBranchId: 1234 });
    const secondResult = await BranchModel.findAll();
    expect(secondResult).toHaveLength(numtestDbDefaults + 1);
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(BranchModel.prototype.createBuild).toBeDefined();
      expect(BranchModel.prototype.removeBuild).toBeDefined();
      expect(BranchModel.prototype.getBuilds).toBeDefined();
      expect(BranchModel.prototype.addBuild).toBeDefined();
      expect(BranchModel.prototype.addBuilds).toBeDefined();
      expect(BranchModel.prototype.getOwner).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await BranchModel.findOne({
        where: { id: testDb.branchCiv6.id },
        include: [BranchModel.associations.owner, BranchModel.associations.builds],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();
      expect(modelWithAssociations?.builds?.length).toBeGreaterThan(0);
    });
  });
});
