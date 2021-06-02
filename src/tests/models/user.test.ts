import { getDBInstance } from '../../models/db/database';
import { UserModel } from '../../models/db/user';
import { SampleDatabase } from '../../utils/sampledatabase';

describe('src/models/user', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await UserModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(UserModel.prototype.addGroupsWithUser).toBeDefined();
      expect(UserModel.prototype.removeGroupsWithUser).toBeDefined();
      expect(UserModel.prototype.getGroupsWithUser).toBeDefined();

      expect(UserModel.prototype.getOwner).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await UserModel.findOne({
        where: { id: testDb.userCto.id },
        include: [UserModel.associations.owner, UserModel.associations.groupsWithUser],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();
      expect(modelWithAssociations?.groupsWithUser?.length).toBeGreaterThan(0);
    });
  });
});
