import { BranchModel } from '../db/branch';
import { DivisionModel } from '../db/division';
import { GameModel } from '../db/game';
import { GroupModel } from '../db/group';
import { PermissionModel, Permissions } from '../db/permission';
import { UserModel } from '../db/user';

export class SampleDatabase {
  public division?: DivisionModel;

  public gameCiv?: GameModel;

  public gameKerbel?: GameModel;

  public gameXcom2?: GameModel;

  public gameWarOfChosen?: GameModel;

  public gameCiv6?: GameModel;

  public gameGatheringStorm?: GameModel;

  public gameRiseAndFall?: GameModel;

  public branchXcom?: BranchModel;

  public branchWarOfChosen?: BranchModel;

  public branchCiv6?: BranchModel;

  public branchGatheringStorm?: BranchModel;

  public branchRiseAndFall?: BranchModel;

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

    // Games that relate to test data in BDS and real Contentful IDs
    this.gameXcom2 = await this.division.createGame(
      { contentfulId: '6sAfVxoGuShx9DV38DcFxI', bdsTitleId: 1000000 },
      { isNewRecord: true }
    );
    this.gameWarOfChosen = await this.division.createGame(
      { contentfulId: '5Apf8DiUW6dVyqmwjytKzf', bdsTitleId: 1000001 },
      { isNewRecord: true }
    );
    this.gameCiv6 = await this.division.createGame(
      { contentfulId: '6MjdXYJ6dk2kxSXh0C0H60', bdsTitleId: 1000003 },
      { isNewRecord: true }
    );
    this.gameGatheringStorm = await this.division.createGame(
      { contentfulId: '5r3Loln4BEezgXtidiCxHm', bdsTitleId: 1000066 },
      { isNewRecord: true }
    );
    this.gameRiseAndFall = await this.division.createGame(
      { contentfulId: 'tz1zm9ktk7RtSTH6STkhG', bdsTitleId: 1000067 },
      { isNewRecord: true }
    );

    // Branches for "real" games
    this.branchXcom = await this.gameXcom2.createBranch({
      contentfulId: 'xcom2TestBranch',
      bdsBranchId: 4000000,
    });
    this.branchWarOfChosen = await this.gameWarOfChosen.createBranch({
      contentfulId: 'warOfChosenTestBranch',
      bdsBranchId: 4000003,
    });
    this.branchCiv6 = await this.gameCiv6.createBranch({
      contentfulId: 'civ6TestBranch',
      bdsBranchId: 4000001,
    });
    this.branchGatheringStorm = await this.gameGatheringStorm.createBranch({
      contentfulId: 'gatheringStormTestBranch',
      bdsBranchId: 4000047,
    });
    this.branchRiseAndFall = await this.gameRiseAndFall.createBranch({
      contentfulId: 'riseAndFallTestBranch',
      bdsBranchId: 4000048,
    });

    // Xcom builds
    const xcomBuild1 = await this.gameXcom2.createBuild({
      contentfulId: 'xcom2TestBuild001',
      bdsBuildId: 2000000,
    });
    const xcomBuild2 = await this.gameXcom2.createBuild({
      contentfulId: 'xcom2TestBuild002',
      bdsBuildId: 2000070,
    });
    const xcomBuild3 = await this.gameXcom2.createBuild({
      contentfulId: 'xcom2TestBuild003',
      bdsBuildId: 2000071,
    });
    await this.branchXcom.addBuild(xcomBuild1);
    await this.branchXcom.addBuild(xcomBuild2);
    await this.branchXcom.addBuild(xcomBuild3);

    // War of the chosen builds
    const wocBuild1 = await this.gameWarOfChosen.createBuild({
      contentfulId: 'warOfChosenTestBuild001',
      bdsBuildId: 2000004,
    });
    const wocBuild2 = await this.gameWarOfChosen.createBuild({
      contentfulId: 'warOfChosenTestBuild002',
      bdsBuildId: 2000005,
    });
    const wocBuild3 = await this.gameWarOfChosen.createBuild({
      contentfulId: 'warOfChosenTestBuild003',
      bdsBuildId: 2000010,
    });
    await this.branchWarOfChosen.addBuild(wocBuild1);
    await this.branchWarOfChosen.addBuild(wocBuild2);
    await this.branchWarOfChosen.addBuild(wocBuild3);

    // Civ6 builds
    const civ6Build1 = await this.gameCiv6.createBuild({
      contentfulId: 'civ6TestBuild001',
      bdsBuildId: 2000001,
    });
    await this.branchCiv6.addBuild(civ6Build1);

    // Gathering Storm builds
    const gatheringStormBuild1 = await this.gameGatheringStorm.createBuild({
      contentfulId: 'gatheringStormTestBuild001',
      bdsBuildId: 2000073,
    });
    await this.branchGatheringStorm.addBuild(gatheringStormBuild1);

    // Rise and Fall builds
    const riseAndFallBuild1 = await this.gameRiseAndFall.createBuild({
      contentfulId: 'riseAndFallTestBuild001',
      bdsBuildId: 2000074,
    });
    await this.branchRiseAndFall.addBuild(riseAndFallBuild1);

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
