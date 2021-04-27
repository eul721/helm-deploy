import { getDBInstance } from '../../models/db/database';
import { GroupModel } from '../../models/db/group';
import { PermissionModel } from '../../models/db/permission';
import { RoleModel } from '../../models/db/role';
import { UserModel } from '../../models/db/user';

describe('src/models/rbac', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  describe('when initializing the tables', () => {
    it('should initialize Group tables', async () => {
      await expect(GroupModel.findAll()).resolves.toEqual([]);
    });

    it('should initialize Permission tables', async () => {
      await expect(PermissionModel.findAll()).resolves.toEqual([]);
    });

    it('should initialize Role tables', async () => {
      await expect(RoleModel.findAll()).resolves.toEqual([]);
    });

    it('should initialize User tables', async () => {
      await expect(UserModel.findAll()).resolves.toEqual([]);
    });
  });
});
