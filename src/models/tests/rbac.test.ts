import { getDBInstance } from '../db/database';
import { PermissionType } from '../db/definitions';
import {
  Group,
  GroupRole,
  isResourceContainedByNamespace,
  Permission,
  Role,
  RolePermission,
  User,
  userCanRead,
  userCanWrite,
  UserGroup,
  UserRole,
  UserRoleResource,
} from '../db/rbac';

const Mocks = {
  GROUP1: {
    id: 222222,
  },
  USER1: {
    id: 111111,
    external_id: 'email@testframework.com',
  },
  USER2: {
    id: 111112,
    external_id: 'someone@testframework.com',
  },
  USER3: {
    id: 111113,
    external_id: 'someoneelse@testcompany.com',
  },
  ROLES: {
    ADMIN: {
      id: 888888,
      name: 'admin',
    },
    VIEWER: {
      id: 888889,
      name: 'viewer',
    },
    CREATOR: {
      id: 888890,
      name: 'creator',
    },
    EDITOR: {
      id: 888891,
      name: 'editor',
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
  PERMISSIONS: {
    CREATE: {
      id: PermissionType.CREATE,
    },
    READ: {
      id: PermissionType.READ,
    },
    UPDATE: {
      id: PermissionType.UPDATE,
    },
    DELETE: {
      id: PermissionType.DELETE,
    },
  },
};

async function baseSetupDB() {
  // Create base permissions
  await Promise.all([
    Permission.create(Mocks.PERMISSIONS.CREATE),
    Permission.create(Mocks.PERMISSIONS.READ),
    Permission.create(Mocks.PERMISSIONS.UPDATE),
    Permission.create(Mocks.PERMISSIONS.DELETE),
  ]);

  // Create users1-3
  await Promise.all([User.create(Mocks.USER1), User.create(Mocks.USER2), User.create(Mocks.USER3)]);

  // Create Roles
  await Promise.all([
    Role.create(Mocks.ROLES.ADMIN),
    Role.create(Mocks.ROLES.CREATOR),
    Role.create(Mocks.ROLES.EDITOR),
    Role.create(Mocks.ROLES.VIEWER),
  ]);

  // Create RolePermissions
  await Promise.all([
    RolePermission.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: PermissionType.CREATE }),
    RolePermission.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: PermissionType.READ }),
    RolePermission.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: PermissionType.UPDATE }),
    RolePermission.create({ roleId: Mocks.ROLES.ADMIN.id, permissionId: PermissionType.DELETE }),

    RolePermission.create({ roleId: Mocks.ROLES.CREATOR.id, permissionId: PermissionType.CREATE }),
    RolePermission.create({ roleId: Mocks.ROLES.CREATOR.id, permissionId: PermissionType.UPDATE }),
    RolePermission.create({ roleId: Mocks.ROLES.CREATOR.id, permissionId: PermissionType.READ }),

    RolePermission.create({ roleId: Mocks.ROLES.EDITOR.id, permissionId: PermissionType.READ }),
    RolePermission.create({ roleId: Mocks.ROLES.EDITOR.id, permissionId: PermissionType.UPDATE }),

    RolePermission.create({ roleId: Mocks.ROLES.VIEWER.id, permissionId: PermissionType.READ }),
  ]);
}

describe('src/models/rbac', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  describe('when initializing the tables', () => {
    it('should initialize Group tables', async () => {
      await expect(Group.findAll()).resolves.toEqual([]);
    });

    it('should initialize GroupRole tables', async () => {
      await expect(GroupRole.findAll()).resolves.toEqual([]);
    });

    it('should initialize Permission tables', async () => {
      await expect(Permission.findAll()).resolves.toEqual([]);
    });

    it('should initialize Role tables', async () => {
      await expect(Role.findAll()).resolves.toEqual([]);
    });

    it('should initialize User tables', async () => {
      await expect(User.findAll()).resolves.toEqual([]);
    });

    it('should initialize UserGroup tables', async () => {
      await expect(UserGroup.findAll()).resolves.toEqual([]);
    });

    it('should initialize UserRole tables', async () => {
      await expect(UserRole.findAll()).resolves.toEqual([]);
    });

    it('should initialize UserRoleResource tables', async () => {
      await expect(UserRoleResource.findAll()).resolves.toEqual([]);
    });

    describe('with UserRoleResource model', () => {
      let userRoleId: number;

      beforeEach(async () => {
        userRoleId = 1234321;
        await User.create(Mocks.USER1);
        await Role.create(Mocks.ROLES.EDITOR);
        await UserRole.create({
          id: userRoleId,
          userId: Mocks.USER1.id,
          roleId: Mocks.ROLES.EDITOR.id,
        });
      });

      it('should enforce a unique constraint on the pair', async () => {
        await expect(
          UserRoleResource.create({
            userRoleId,
            namespace: 'test123',
          })
        ).resolves.not.toThrow();
      });
    });
  });

  describe('when adding a user to a group', () => {
    beforeEach(async () => {
      await User.create(Mocks.USER1);
      await Group.create(Mocks.GROUP1);
    });

    it('should have an existing user', async () => {
      const userResult = await User.findOne({
        where: {
          external_id: Mocks.USER1.external_id,
        },
      });

      expect(userResult).toHaveProperty('id', Mocks.USER1.id);
      expect(userResult).toHaveProperty('external_id', Mocks.USER1.external_id);
    });

    it('should have an existing group', async () => {
      const groupResult = await Group.findOne({ where: { id: Mocks.GROUP1.id } });
      expect(groupResult).toHaveProperty('id', Mocks.GROUP1.id);
    });

    it('should assign the user to a group', async () => {
      const createResult = await UserGroup.create({
        groupId: Mocks.GROUP1.id,
        userId: Mocks.USER1.id,
      });
      expect(createResult).not.toBeUndefined();
      const userGroupResult = await UserGroup.findOne({
        where: { userId: Mocks.USER1.id },
      });
      expect(userGroupResult).toHaveProperty('groupId', Mocks.GROUP1.id);
      expect(userGroupResult).toHaveProperty('userId', Mocks.USER1.id);
    });
  });

  describe('#isResourceContainedByNamespace', () => {
    let resource: string;
    let namespace: string;

    describe('when a resource is contained by a 1st level wildcard namespace definition', () => {
      beforeEach(() => {
        resource = '/testnamespace/games/testgame';
        namespace = '/*';
      });

      it('should return true', () => {
        expect(isResourceContainedByNamespace(resource, namespace)).toBe(true);
      });
    });

    describe('when a resource is not contained by a 1st level namespace definition', () => {
      beforeEach(() => {
        resource = '/testnamespace/games/testgame';
        namespace = '/othernamespace/games/testgame';
      });

      it('should return false', () => {
        expect(isResourceContainedByNamespace(resource, namespace)).toBe(false);
      });
    });

    describe('when a resource is contained by a 2nd level wildcard namespace definition', () => {
      beforeEach(() => {
        resource = '/testnamespace/games/testgame';
        namespace = '/testnamespace/*';
      });

      it('should return true', () => {
        expect(isResourceContainedByNamespace(resource, namespace)).toBe(true);
      });
    });

    describe('when a resource is not contained by a 2nd level namespace definition', () => {
      beforeEach(() => {
        resource = '/testnamespace/games/testgame';
        namespace = '/testnamespace/builds/*';
      });

      it('should return false', () => {
        expect(isResourceContainedByNamespace(resource, namespace)).toBe(false);
      });
    });

    describe('when a resource is contained by a 3rd level wildcard namespace definition', () => {
      beforeEach(() => {
        resource = '/testnamespace/games/testgame';
        namespace = '/testnamespace/games/*';
      });

      it('should return true', () => {
        expect(isResourceContainedByNamespace(resource, namespace)).toBe(true);
      });
    });

    describe('when a resource is not contained by a 3rd level namespace definition', () => {
      beforeEach(() => {
        resource = '/testnamespace/games/testgame';
        namespace = '/testnamespace/games/othergame';
      });

      it('should return true', () => {
        expect(isResourceContainedByNamespace(resource, namespace)).toBe(false);
      });
    });
  });

  describe('when testing permissions', () => {
    let userId: number;
    let resource: string;

    beforeEach(async () => {
      await Permission.create(Mocks.PERMISSIONS.CREATE);
      await Permission.create(Mocks.PERMISSIONS.READ);
      await Permission.create(Mocks.PERMISSIONS.UPDATE);
      await Permission.create(Mocks.PERMISSIONS.DELETE);

      await User.create(Mocks.USER1);
      await User.create(Mocks.USER2);
      await User.create(Mocks.USER3);

      await Role.create(Mocks.ROLES.VIEWER);
      await Role.create(Mocks.ROLES.CREATOR);
      await Role.create(Mocks.ROLES.EDITOR);
    });

    describe('with a basic role permission', () => {
      beforeEach(async () => {
        resource = '/privatedivision/games/kerbalspaceprogram';
        await RolePermission.create({
          permissionId: Mocks.PERMISSIONS.READ.id,
          roleId: Mocks.ROLES.VIEWER.id,
        });
        await UserRole.create({
          id: Mocks.USERROLES.USER1VIEWER.id,
          roleId: Mocks.ROLES.VIEWER.id,
          userId: Mocks.USER1.id,
        });
        await UserRole.create({
          id: Mocks.USERROLES.USER2CREATOR.id,
          roleId: Mocks.ROLES.CREATOR.id,
          userId: Mocks.USER2.id,
        });
        await UserRoleResource.create({
          userRoleId: Mocks.USERROLES.USER1VIEWER.id,
          namespace: '/privatedivision/games/*',
        });
      });

      describe('when the user should be able to read the resource', () => {
        beforeEach(() => {
          userId = Mocks.USER1.id;
        });

        it('should allow the user to view the resource', async () => {
          const result = await userCanRead(userId, resource);
          expect(result).toBe(true);
        });
      });

      describe('when the user should not be able to read the resource', () => {
        describe('due to not having READ roles', () => {
          beforeEach(() => {
            userId = Mocks.USER2.id;
          });

          it('should not allow the user to view the resource', async () => {
            const result = await userCanRead(userId, resource);
            expect(result).toBe(false);
          });
        });

        describe('due to not having any roles', () => {
          beforeEach(() => {
            userId = Mocks.USER3.id;
          });

          it('should not allow the user to view the resource', async () => {
            const result = await userCanRead(userId, resource);
            expect(result).toBe(false);
          });
        });
      });

      describe('when the user should be able to modify the resource', () => {
        beforeEach(async () => {
          await RolePermission.create({
            permissionId: Mocks.PERMISSIONS.UPDATE.id,
            roleId: Mocks.ROLES.EDITOR.id,
          });
          await UserRole.create({
            id: Mocks.USERROLES.USER3EDITOR.id,
            roleId: Mocks.ROLES.EDITOR.id,
            userId: Mocks.USER3.id,
          });
          await UserRoleResource.create({
            userRoleId: Mocks.USERROLES.USER3EDITOR.id,
            namespace: '/privatedivision/games/ksp',
          });
          await UserRoleResource.create({
            userRoleId: Mocks.USERROLES.USER1VIEWER.id,
            namespace: '/privatedivision/games/ksp',
          });
        });

        it('should allow the user to edit the resource', async () => {
          const result = await userCanWrite(Mocks.USER3.id, '/privatedivision/games/ksp');
          expect(result).toBe(true);
        });
      });

      describe('when the user should not be able to modify the resource', () => {
        describe('because the user has no roles associated with the resource', () => {
          it('should not allow the user to edit the resource', async () => {
            const result = await userCanWrite(Mocks.USER2.id, '/privatedivision/games/ksp');
            expect(result).toBe(false);
          });
        });

        describe('because the user does not have write associated with the resource', () => {
          it('should not allow the user to edit the resource', async () => {
            const result = await userCanWrite(Mocks.USER1.id, '/privatedivision/games/ksp');
            expect(result).toBe(false);
          });
        });
      });
    });
  });

  describe('/User', () => {
    beforeEach(async () => {
      await baseSetupDB();
    });

    describe('#getUserResourceDefinitions', () => {
      let userId: number;

      describe('when the user has roles', () => {
        beforeEach(async () => {
          await UserRole.create({
            userId: Mocks.USER1.id,
            roleId: Mocks.ROLES.CREATOR.id,
          });
          userId = Mocks.USER1.id;
        });

        describe('and the user has no rights to Resources', () => {
          it('should return an empty array', async () => {
            const result = await User.getUserResourceDefinitions(userId, PermissionType.READ);
            expect(result).toHaveLength(0);
          });
        });

        describe('and the user has the right to Resources', () => {
          beforeEach(async () => {
            const userRoleId = 12345;
            await UserRole.create({
              id: userRoleId,
              userId: Mocks.USER1.id,
              roleId: Mocks.ROLES.VIEWER.id,
            });
            await UserRoleResource.create({
              userRoleId,
              namespace: '/testns/game/foogame',
            });
          });

          it('should return an empty array', async () => {
            const result = await User.getUserResourceDefinitions(userId, PermissionType.READ);
            expect(result).toHaveLength(1);
          });
        });
      });
    });
  });
});
