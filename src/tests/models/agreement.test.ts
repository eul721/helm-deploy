import { AgreementModel } from '../../models/db/agreement';
import { getDBInstance } from '../../models/db/database';
import { SampleDatabase } from '../../utils/sampledatabase';

describe('src/models/branch', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const results = await AgreementModel.findAll();
    expect(results.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(AgreementModel.prototype.getOwner).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await AgreementModel.findOne({
        where: { ownerId: testDb.gameCiv6.id },
        include: [AgreementModel.associations.owner, AgreementModel.associations.fields],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();
      expect(modelWithAssociations?.names.en).toBeTruthy();
    });
  });
});
