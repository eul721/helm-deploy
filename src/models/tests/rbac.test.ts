import { getDBInstance } from '../db/database';
import { DivisionAttributes, DivisionModel } from '../db/division';
import { GroupModel } from '../db/group';
import { GroupRolesModel } from '../db/grouproles';
import { PermissionModel, Permissions } from '../db/permission';
import { RoleModel } from '../db/role';
import { RolePermissionsModel } from '../db/rolepermissions';
import { UserAttributes, UserModel } from '../db/user';

const mainDivision: DivisionAttributes = { id: 1, name: 'test division' };

const user1: UserAttributes = {
  id: 111111,
  externalId: 'email@testframework.com',
  parentDivision: mainDivision.id,
};

const user2: UserAttributes = {
  id: 111112,
  externalId: 'someone@testframework.com',
  parentDivision: mainDivision.id,
};

const user3: UserAttributes = {
  id: 111113,
  externalId: 'someoneelse@testcompany.com',
  parentDivision: mainDivision.id,
};

const Mocks = {
  GROUP1: {
    id: 222222,
    name: 'test group',
    parentDivision: mainDivision.id,
  },
  ROLES: {
    ADMIN: {
      id: 888888,
      name: 'admin',
      parentDivision: mainDivision.id,
    },
    VIEWER: {
      id: 888889,
      name: 'viewer',
      parentDivision: mainDivision.id,
    },
    CREATOR: {
      id: 888890,
      name: 'creator',
      parentDivision: mainDivision.id,
    },
    EDITOR: {
      id: 888891,
      name: 'editor',
      parentDivision: mainDivision.id,
    },
  },
  USERROLES: {
    USER1VIEWER: {
      id: 777777,
      userId: 111111,
      roleId: 888889,
    },
    USER2CREATOR: {
      id: 777778,
      userId: 111112,
      roleId: 888890,
    },
    USER3EDITOR: {
      id: 777779,
      userId: 111113,
      roleId: 888891,
    },
  },
};

async function baseSetupDB() {
  await DivisionModel.create(mainDivision);

  // Create base permissions
  Promise.all(Permissions.map(async id => PermissionModel.create({ id })));

  // Create users1-3
  await Promise.all([UserModel.create(user1), UserModel.create(user2), UserModel.create(user3)]);

  // Create Roles
  await Promise.all([
    RoleModel.create(Mocks.ROLES.ADMIN),
    RoleModel.create(Mocks.ROLES.CREATOR),
    RoleModel.create(Mocks.ROLES.EDITOR),
    RoleModel.create(Mocks.ROLES.VIEWER),
  ]);

  // Create RolePermissionsModels
  await Promise.all([
    RolePermissionsModel.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: 'create' }),
    RolePermissionsModel.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: 'read' }),
    RolePermissionsModel.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: 'update' }),
    RolePermissionsModel.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: 'delete' }),

    RolePermissionsModel.create({ roleId: Mocks.ROLES.CREATOR.id, permissionId: 'create' }),
    RolePermissionsModel.create({ roleId: Mocks.ROLES.CREATOR.id, permissionId: 'update' }),
    RolePermissionsModel.create({ roleId: Mocks.ROLES.CREATOR.id, permissionId: 'read' }),

    RolePermissionsModel.create({ roleId: Mocks.ROLES.EDITOR.id, permissionId: 'read' }),
    RolePermissionsModel.create({ roleId: Mocks.ROLES.EDITOR.id, permissionId: 'update' }),

    RolePermissionsModel.create({ roleId: Mocks.ROLES.VIEWER.id, permissionId: 'read' }),
  ]);

  GroupModel.create(Mocks.GROUP1);
}

describe('src/models/rbac', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  describe('when initializing the tables', () => {
    it('should initialize Group tables', async () => {
      await expect(GroupModel.findAll()).resolves.toEqual([]);
    });

    it('should initialize GroupRole tables', async () => {
      await expect(GroupRolesModel.findAll()).resolves.toEqual([]);
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

  describe('when adding a user to a group', () => {
    beforeEach(async () => {
      await baseSetupDB();
    });

    it('should have an existing user', async () => {
      const userResult = await UserModel.findOne({
        where: {
          externalId: user1.externalId,
        },
      });

      expect(userResult).toHaveProperty('id', user1.id);
      expect(userResult).toHaveProperty('externalId', user1.externalId);
    });

    it('should have an existing group', async () => {
      const groupResult = await GroupModel.findOne({ where: { id: Mocks.GROUP1.id } });
      expect(groupResult).toHaveProperty('id', Mocks.GROUP1.id);
    });
  });
});
