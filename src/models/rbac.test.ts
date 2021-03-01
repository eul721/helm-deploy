import { getDBInstance } from './database';
import {
  Group,
  GroupRole,
  isResourceContainedByNamespace,
  Namespace,
  Permission,
  Role,
  RolePermission,
  User,
  userCanRead,
  UserGroup,
  UserRole,
  UserRoleResource,
} from './rbac';

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
  },
  PERMISSIONS: {
    CREATE: {
      id: 'create',
    },
    READ: {
      id: 'read',
    },
    UPDATE: {
      id: 'update',
    },
    DELETE: {
      id: 'delete',
    },
  },
};

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

    it('should initialize Namespace tables', async () => {
      await expect(Namespace.findAll()).resolves.toEqual([]);
    });

    it('should initialize Permission tables', async () => {
      await expect(Permission.findAll()).resolves.toEqual([]);
    });

    it('should initialize Role tables', async () => {
      await expect(Role.findAll()).resolves.toEqual([]);
    });

    it('should initialize RolePermission tables', async () => {
      await expect(RolePermission.findAll()).resolves.toEqual([]);
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
    });

    describe('with a basic role permission', () => {
      beforeEach(async () => {
        resource = '/privatedivision/games/kerbalspaceprogram';
        await User.create(Mocks.USER1);
        await User.create(Mocks.USER2);
        await User.create(Mocks.USER3);
        await Role.create(Mocks.ROLES.VIEWER);
        await Role.create(Mocks.ROLES.CREATOR);
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

      describe('when the user should be able to see the resource', () => {
        beforeEach(() => {
          userId = Mocks.USER1.id;
        });

        it('should allow the user to view the resource', async () => {
          const result = await userCanRead(userId, resource);
          expect(result).toBe(true);
        });
      });

      describe('when the user should not be able to see a resource', () => {
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
    });
  });
});
