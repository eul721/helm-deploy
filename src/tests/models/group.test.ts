import { getDBInstance } from '../../models/db/database';
import { GroupModel } from '../../models/db/group';
import { SampleDatabase } from '../testutils';

describe('src/models/groupd', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await GroupModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(GroupModel.prototype.addAssignedRole).toBeDefined();
      expect(GroupModel.prototype.removeAssignedRole).toBeDefined();
      expect(GroupModel.prototype.getAssignedRoles).toBeDefined();

      expect(GroupModel.prototype.addAssignedUser).toBeDefined();
      expect(GroupModel.prototype.removeAssignedUser).toBeDefined();
      expect(GroupModel.prototype.getAssignedUsers).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await GroupModel.findOne({
        where: { id: testDb.adminGroup?.id },
        include: [
          GroupModel.associations.assignedRoles,
          GroupModel.associations.assignedUsers,
          GroupModel.associations.owner,
        ],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();

      expect(modelWithAssociations?.assignedRoles?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.assignedUsers?.length).toBeGreaterThan(0);
    });
  });
});
