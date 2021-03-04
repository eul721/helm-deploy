import { app } from './app';
import { info, warn } from './logger';
import { initializeDB } from './models/database';
import { PermissionType } from './models/definitions';
import * as RBAC from './models/rbac';

const { NODE_ENVIRONMENT, PORT = 5000 } = process.env;

async function reinitializeDummyData() {
  info('====================================\n       Generating Test Data\n====================================');
  await RBAC.Permission.create({ id: PermissionType.CREATE });
  await RBAC.Permission.create({ id: PermissionType.READ });
  await RBAC.Permission.create({ id: PermissionType.UPDATE });
  await RBAC.Permission.create({ id: PermissionType.DELETE });

  await RBAC.User.create({
    id: 1111111111,
    external_id: 'larrydavid@comedy.tv',
  });
  await RBAC.User.create({
    id: 1111111112,
    external_id: 'teddanson@thegood.place',
  });
  await RBAC.User.create({
    id: 1111111113,
    external_id: 'julia@vice.president',
  });

  await RBAC.Role.create({
    id: 3333333333,
    name: 'admin',
  });
  await Promise.all([
    RBAC.RolePermission.create({ roleId: 3333333333, permissionId: PermissionType.CREATE }),
    RBAC.RolePermission.create({ roleId: 3333333333, permissionId: PermissionType.READ }),
    RBAC.RolePermission.create({ roleId: 3333333333, permissionId: PermissionType.UPDATE }),
    RBAC.RolePermission.create({ roleId: 3333333333, permissionId: PermissionType.DELETE }),
  ]);

  await RBAC.Role.create({
    id: 3333333334,
    name: 'creator',
  });
  await Promise.all([
    RBAC.RolePermission.create({ roleId: 3333333334, permissionId: PermissionType.CREATE }),
    RBAC.RolePermission.create({ roleId: 3333333334, permissionId: PermissionType.READ }),
  ]);

  await RBAC.Role.create({
    id: 3333333335,
    name: 'editor',
  });
  await Promise.all([
    RBAC.RolePermission.create({ roleId: 3333333335, permissionId: PermissionType.UPDATE }),
    RBAC.RolePermission.create({ roleId: 3333333335, permissionId: PermissionType.READ }),
  ]);

  await RBAC.Role.create({
    id: 3333333336,
    name: 'viewer',
  });
  await RBAC.RolePermission.create({ roleId: 3333333336, permissionId: PermissionType.READ });

  await RBAC.UserRole.create({
    id: 5555555555,
    userId: 1111111113,
    roleId: 3333333333,
  });

  await RBAC.UserRole.create({
    id: 5555555556,
    userId: 1111111112,
    roleId: 3333333334,
  });

  await RBAC.UserRole.create({
    id: 5555555557,
    userId: 1111111111,
    roleId: 3333333336,
  });

  await RBAC.UserRoleResource.create({
    userRoleId: 5555555555,
    namespace: '/privatedivision/games/kerbalspaceprogram',
  });
  info('====================================\n        Finished Test Data\n====================================');
}

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      info(`Server listening on port ${PORT}`);
    });

    // Build and nuke the database if develop
    if (NODE_ENVIRONMENT === 'development') {
      warn('Reinitializing database');
      reinitializeDummyData();
    }
  })
  .catch(initErr => {
    warn('Failed initializing database:', initErr);
  });
