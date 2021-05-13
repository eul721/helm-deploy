import { getDBInstance } from '../../models/db/database';
import { PermissionModel, Permissions } from '../../models/db/permission';
import { SampleDatabase } from '../testutils';

describe('src/models/permission', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await testDb.initAll();
  });

  it('should initialize correctly', async () => {
    const firstResult = await PermissionModel.findAll();
    expect(firstResult.length).toBeGreaterThan(0);
  });

  describe('type check', () => {
    it('should have defined methods', async () => {
      expect(PermissionModel.prototype.createRolesWithPermission).toBeDefined();
      expect(PermissionModel.prototype.removeRolesWithPermission).toBeDefined();
      expect(PermissionModel.prototype.getRolesWithPermission).toBeDefined();
    });

    it('should have correctly defined associations', async () => {
      const modelWithAssociations = await PermissionModel.findOne({
        where: { id: Permissions[0] },
        include: [PermissionModel.associations.rolesWithPermission],
      });

      expect(modelWithAssociations).toBeTruthy();

      expect(modelWithAssociations?.rolesWithPermission?.length).toBeGreaterThan(0);
    });
  });
});
