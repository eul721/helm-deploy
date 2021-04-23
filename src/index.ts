import { app } from './app';
import { info, warn } from './logger';
import { DivisionModel } from './models/db/division';
import { PermissionModel, Permissions } from './models/db/permission';
import { UserModel } from './models/db/user';
import { RoleModel } from './models/db/role';
import { RolePermissionsModel } from './models/db/rolepermissions';
import { GameModel } from './models/db/game';
import { RoleGamesModel } from './models/db/rolegames';
import { GroupModel } from './models/db/group';
import { GroupUsersModel } from './models/db/groupusers';
import { GroupRolesModel } from './models/db/grouproles';
import { initializeDB } from './models/db/database';

const { NODE_ENVIRONMENT, PORT = 5000, DATABASE_DROP } = process.env;

async function reinitializeDummyData() {
  info('====================================\n       Generating Test Data\n====================================');
  Promise.all(Permissions.map(async id => PermissionModel.create({ id })));

  const divisionInstance = await DivisionModel.create({ name: 'NotFake Division' });

  const user1 = await UserModel.create({
    externalId: 'larrydavid@comedy.tv',
    parentDivision: divisionInstance.id,
  });
  const user2 = await UserModel.create({
    externalId: 'teddanson@thegood.place',
    parentDivision: divisionInstance.id,
  });
  const user3 = await UserModel.create({
    externalId: 'julia@vice.president',
    parentDivision: divisionInstance.id,
  });
  const user4 = await UserModel.create({
    externalId: 'test@user',
    parentDivision: divisionInstance.id,
  });

  const gameCiv = await GameModel.create({ bdsTitleId: 11, contentfulId: 'qwerty' });
  const gameKerbel = await GameModel.create({ bdsTitleId: 12, contentfulId: 'abcdefg' });

  const adminRole = await RoleModel.create({
    name: 'admin',
    parentDivision: divisionInstance.id,
  });

  await Promise.all([
    RolePermissionsModel.create({ roleId: adminRole.id, permissionId: 'create' }),
    RolePermissionsModel.create({ roleId: adminRole.id, permissionId: 'read' }),
    RolePermissionsModel.create({ roleId: adminRole.id, permissionId: 'update' }),
    RolePermissionsModel.create({ roleId: adminRole.id, permissionId: 'delete' }),
    RolePermissionsModel.create({ roleId: adminRole.id, permissionId: 'all-games-access' }),
  ]);

  const creatorRole = await RoleModel.create({
    name: 'creator',
    parentDivision: divisionInstance.id,
  });
  await Promise.all([
    RolePermissionsModel.create({ roleId: creatorRole.id, permissionId: 'create' }),
    RolePermissionsModel.create({ roleId: creatorRole.id, permissionId: 'read' }),
    RolePermissionsModel.create({ roleId: creatorRole.id, permissionId: 'all-games-access' }),
  ]);

  const civEditorRole = await RoleModel.create({
    name: 'civ editor',
    parentDivision: divisionInstance.id,
  });
  await Promise.all([
    RolePermissionsModel.create({ roleId: civEditorRole.id, permissionId: 'update' }),
    RolePermissionsModel.create({ roleId: civEditorRole.id, permissionId: 'read' }),
  ]);
  RoleGamesModel.create({ roleId: civEditorRole.id, gameId: gameCiv.id });

  const viewerRole = await RoleModel.create({
    name: 'viewer-all',
    parentDivision: divisionInstance.id,
  });
  await RolePermissionsModel.create({ roleId: viewerRole.id, permissionId: 'read' });
  await RolePermissionsModel.create({ roleId: viewerRole.id, permissionId: 'all-games-access' });
  RoleGamesModel.create({ roleId: viewerRole.id, gameId: gameKerbel.id });
  RoleGamesModel.create({ roleId: viewerRole.id, gameId: gameCiv.id });

  const adminGroup = await GroupModel.create({ parentDivision: divisionInstance.id, name: 'admins' });
  const devopsGroup = await GroupModel.create({ parentDivision: divisionInstance.id, name: 'devops' });
  const qaGroup = await GroupModel.create({ parentDivision: divisionInstance.id, name: 'QA' });
  const civDevGroup = await GroupModel.create({ parentDivision: divisionInstance.id, name: 'civ devs' });

  await Promise.all([
    GroupRolesModel.create({ groupId: adminGroup.id, roleId: adminRole.id }),
    GroupRolesModel.create({ groupId: devopsGroup.id, roleId: creatorRole.id }),
    GroupRolesModel.create({ groupId: qaGroup.id, roleId: viewerRole.id }),
    GroupRolesModel.create({ groupId: civDevGroup.id, roleId: viewerRole.id }),
    GroupRolesModel.create({ groupId: civDevGroup.id, roleId: civEditorRole.id }),
  ]);

  await Promise.all([
    GroupUsersModel.create({ groupId: adminGroup.id, userId: user1.id }),
    GroupUsersModel.create({ groupId: devopsGroup.id, userId: user2.id }),
    GroupUsersModel.create({ groupId: qaGroup.id, userId: user3.id }),
    GroupUsersModel.create({ groupId: civDevGroup.id, userId: user3.id }),
    GroupUsersModel.create({ groupId: civDevGroup.id, userId: user4.id }),
  ]);

  info('====================================\n        Finished Test Data\n====================================');
}

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      info(`Server listening on port ${PORT}`);
    });

    info(`Env: ${NODE_ENVIRONMENT}`);
    // Build and nuke the database if develop
    if (DATABASE_DROP === 'true' && NODE_ENVIRONMENT === 'development') {
      warn('Reinitializing database');
      reinitializeDummyData();
    }
  })
  .catch(initErr => {
    warn('Failed initializing database:', initErr);
  });
