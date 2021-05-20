import { getDBInstance } from '../../models/db/database';
import { RoleModel } from '../../models/db/role';
import { SampleDatabase } from '../testutils';

describe('src/models/role', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await RoleModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(RoleModel.prototype.addAssignedGame).toBeDefined();
      expect(RoleModel.prototype.addAssignedGames).toBeDefined();
      expect(RoleModel.prototype.removeAssignedGame).toBeDefined();
      expect(RoleModel.prototype.getAssignedGames).toBeDefined();

      expect(RoleModel.prototype.addAssignedPermission).toBeDefined();
      expect(RoleModel.prototype.addAssignedPermissions).toBeDefined();
      expect(RoleModel.prototype.removeAssignedPermission).toBeDefined();
      expect(RoleModel.prototype.getAssignedPermissions).toBeDefined();

      expect(RoleModel.prototype.createGroupsWithRole).toBeDefined();
      expect(RoleModel.prototype.removeGroupsWithRole).toBeDefined();
      expect(RoleModel.prototype.getGroupsWithRole).toBeDefined();

      expect(RoleModel.prototype.getOwner).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await RoleModel.findOne({
        where: { id: testDb.civEditorRole.id },
        include: [
          RoleModel.associations.owner,
          RoleModel.associations.assignedGames,
          RoleModel.associations.assignedPermissions,
          RoleModel.associations.groupsWithRole,
        ],
      });

      expect(modelWithAssociations).toBeTruthy();
      expect(modelWithAssociations?.owner).toBeTruthy();
      expect(modelWithAssociations?.assignedGames?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.assignedPermissions?.length).toBeGreaterThan(0);
      expect(modelWithAssociations?.groupsWithRole?.length).toBeGreaterThan(0);
    });
  });
});
