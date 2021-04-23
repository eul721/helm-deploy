import { DivisionModel } from '../db/division';
import { GameModel } from '../db/game';
import { GroupModel } from '../db/group';
import { PermissionModel, Permissions } from '../db/permission';
import { UserModel } from '../db/user';

export class SampleDatabase {
  public division?: DivisionModel;

  public gameCiv?: GameModel;

  public gameKerbel?: GameModel;

  public adminGroup?: GroupModel;

  public devopsGroup?: GroupModel;

  public qaGroup?: GroupModel;

  public civDevGroup?: GroupModel;

  public civAdminGroup?: GroupModel;

  public userCto?: UserModel;

  public userSrDev?: UserModel;

  public userJrDev?: UserModel;

  public userQA?: UserModel;

  public userGuest?: UserModel;

  public permissions: PermissionModel[] = [];

  public initAll = async () => {
    this.permissions = await Promise.all(Permissions.map(async id => PermissionModel.create({ id })));

    await DivisionModel.create({ name: 'empty div' });
    this.division = await DivisionModel.create({ name: 'NotFake Division' });
    if (!this.division) return;

    this.gameKerbel = await this.division.createGameEntry({ contentfulId: 'abc12345', bdsTitleId: 3333 });
    this.gameCiv = await this.division.createGame({ contentfulId: 'qwerty', bdsTitleId: 1111 }, { isNewRecord: true });

    // users setup
    [this.userCto, this.userSrDev, this.userJrDev, this.userQA, this.userGuest] = await Promise.all([
      this.division.createUserEntry({
        externalId: 'larrydavid@comedy.tv',
      }),
      this.division.createUserEntry({
        externalId: 'teddanson@thegood.place',
      }),
      this.division.createUserEntry({
        externalId: 'julia@vice.president',
      }),
      this.division.createUserEntry({
        externalId: 'test@user',
      }),
      this.division.createUserEntry({
        externalId: 'guest@user',
      }),
    ]);

    // role setup
    const contentAdminRole = await this.division.createRoleEntry({
      name: 'content admin',
    });
    await Promise.all([
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('create')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('read')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('update')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('update-production')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('delete')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('all-games-access')),
    ]);

    const hrAdmin = await this.division.createRoleEntry({
      name: 'hr admin',
    });
    await Promise.all([
      hrAdmin.addAssignedPermission(await PermissionModel.getModel('manage-access')),
      hrAdmin.addAssignedPermission(await PermissionModel.getModel('remove-account')),
      hrAdmin.addAssignedPermission(await PermissionModel.getModel('create-account')),
    ]);

    const rbacAdmin = await this.division.createRoleEntry({
      name: 'rbac admin',
    });
    await Promise.all([
      rbacAdmin.addAssignedPermission(await PermissionModel.getModel('manage-access')),
      rbacAdmin.addAssignedPermission(await PermissionModel.getModel('rbac-admin')),
    ]);

    const civEditorRole = await this.division.createRoleEntry({
      name: 'civ editor',
    });
    await Promise.all([
      civEditorRole.addAssignedPermission(await PermissionModel.getModel('read')),
      civEditorRole.addAssignedPermission(await PermissionModel.getModel('update')),
      civEditorRole.addAssignedPermission(await PermissionModel.getModel('delete')),
    ]);
    civEditorRole.addAssignedGame(this.gameCiv);

    const civAdminRole = await this.division.createRoleEntry({
      name: 'civ admin',
    });
    await Promise.all([
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('read')),
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('update')),
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('delete')),
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('update-production')),
    ]);
    civAdminRole.addAssignedGame(this.gameCiv);

    const viewerRole = await this.division.createRoleEntry({
      name: 'viewer-all',
    });
    await Promise.all([
      viewerRole.addAssignedPermission(await PermissionModel.getModel('read')),
      viewerRole.addAssignedPermission(await PermissionModel.getModel('all-games-access')),
    ]);

    this.adminGroup = await this.division.createGroupEntry({ name: 'admins' });
    this.devopsGroup = await this.division.createGroupEntry({ name: 'devops' });
    this.qaGroup = await this.division.createGroupEntry({ name: 'QA' });
    this.civDevGroup = await this.division.createGroupEntry({ name: 'civ devs' });
    this.civAdminGroup = await this.division.createGroupEntry({ name: 'civ admin' });

    await Promise.all([
      this.adminGroup.addAssignedRole(contentAdminRole),
      this.adminGroup.addAssignedRole(hrAdmin),
      this.adminGroup.addAssignedRole(rbacAdmin),
      this.devopsGroup.addAssignedRole(contentAdminRole),
      this.qaGroup.addAssignedRole(viewerRole),
      this.civDevGroup.addAssignedRole(viewerRole),
      this.civDevGroup.addAssignedRole(civEditorRole),
      this.civAdminGroup.addAssignedRole(civAdminRole),
    ]);

    await Promise.all([
      this.adminGroup.addAssignedUser(this.userCto),
      this.devopsGroup.addAssignedUser(this.userSrDev),
      this.qaGroup.addAssignedUser(this.userQA),
      this.civAdminGroup.addAssignedUser(this.userSrDev),
      this.civDevGroup.addAssignedUser(this.userJrDev),
    ]);
  };
}
