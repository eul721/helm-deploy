import { error } from '../logger';
import { BranchModel } from '../models/db/branch';
import { BuildModel } from '../models/db/build';
import { DivisionModel } from '../models/db/division';
import { GameModel } from '../models/db/game';
import { GroupModel } from '../models/db/group';
import { Locale } from '../models/db/localizedfield';
import { DivisionPermissions, PermissionModel, ResourcePermissions } from '../models/db/permission';
import { RoleModel } from '../models/db/role';
import { UserModel } from '../models/db/user';

export class SampleDatabase {
  public division!: DivisionModel;

  public gameXcom2!: GameModel;

  public gameWarOfChosen!: GameModel;

  public gameCiv6!: GameModel;

  public gameGatheringStorm!: GameModel;

  public gameRiseAndFall!: GameModel;

  public getAllGames() {
    return [this.gameXcom2, this.gameWarOfChosen, this.gameCiv6, this.gameGatheringStorm, this.gameRiseAndFall];
  }

  public branchXcom!: BranchModel;

  public branchWarOfChosen!: BranchModel;

  public branchCiv6!: BranchModel;

  public branchGatheringStorm!: BranchModel;

  public branchRiseAndFall!: BranchModel;

  public civ6Build1!: BuildModel;

  public adminGroup!: GroupModel;

  public devopsGroup!: GroupModel;

  public qaGroup!: GroupModel;

  public civDevGroup!: GroupModel;

  public civAdminGroup!: GroupModel;

  public userCto!: UserModel;

  public userSrDev!: UserModel;

  public userJrDev!: UserModel;

  public userQA!: UserModel;

  public userGuest!: UserModel;

  public civEditorRole!: RoleModel;

  public permissions: PermissionModel[] = [];

  public static contentfulIds: { game: string }[] = [
    { game: '6sAfVxoGuShx9DV38DcFxI' },
    { game: '5Apf8DiUW6dVyqmwjytKzf' },
    { game: '6MjdXYJ6dk2kxSXh0C0H60' },
    { game: '5r3Loln4BEezgXtidiCxHm' },
    { game: 'tz1zm9ktk7RtSTH6STkhG' },
  ];

  public static debugAdminEmail = 'debug@admin';

  public initAll = async () => {
    try {
      this.permissions = await Promise.all(DivisionPermissions.map(async id => PermissionModel.create({ id })));
      this.permissions = await Promise.all(ResourcePermissions.map(async id => PermissionModel.create({ id })));

      await DivisionModel.create({ name: 'empty div' });
      this.division = await DivisionModel.create({ name: 'NotFake Division' });

      // Games that relate to test data in BDS and real Contentful IDs
      await this.createResources();

      // users setup
      [this.userCto, this.userSrDev, this.userJrDev, this.userQA, this.userGuest] = await Promise.all([
        this.division.createUserEntry({
          externalId: SampleDatabase.debugAdminEmail,
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
      await this.createRolesAndGroups();
    } catch (err) {
      error('Failed to set up sample database, error=%s', err);
      throw new Error('Failed to set up sample database');
    }
  };

  private async createRolesAndGroups() {
    const contentAdminRole = await this.division.createRoleEntry({
      name: 'content admin',
    });
    await Promise.all([
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('create')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('read')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('update')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('change-production')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('delete')),
      contentAdminRole.addAssignedPermission(await PermissionModel.getModel('all-games-access')),
    ]);
    await contentAdminRole.addAssignedGames(this.getAllGames());

    const hrAdmin = await this.division.createRoleEntry({
      name: 'hr admin',
    });
    await Promise.all([
      hrAdmin.addAssignedPermission(await PermissionModel.getModel('remove-account')),
      hrAdmin.addAssignedPermission(await PermissionModel.getModel('create-account')),
    ]);

    const rbacAdmin = await this.division.createRoleEntry({
      name: 'rbac admin',
    });
    await Promise.all([rbacAdmin.addAssignedPermission(await PermissionModel.getModel('rbac-admin'))]);

    this.civEditorRole = await this.division.createRoleEntry({
      name: 'civ editor',
    });
    await Promise.all([
      this.civEditorRole.addAssignedPermission(await PermissionModel.getModel('read')),
      this.civEditorRole.addAssignedPermission(await PermissionModel.getModel('update')),
      this.civEditorRole.addAssignedPermission(await PermissionModel.getModel('delete')),
    ]);
    await this.civEditorRole.addAssignedGame(this.gameCiv6);

    const civAdminRole = await this.division.createRoleEntry({
      name: 'civ admin',
    });
    await Promise.all([
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('read')),
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('update')),
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('delete')),
      civAdminRole.addAssignedPermission(await PermissionModel.getModel('change-production')),
    ]);
    await civAdminRole.addAssignedGame(this.gameCiv6);

    const viewerRole = await this.division.createRoleEntry({
      name: 'viewer-all',
    });
    await Promise.all([
      viewerRole.addAssignedPermission(await PermissionModel.getModel('read')),
      viewerRole.addAssignedPermission(await PermissionModel.getModel('all-games-access')),
    ]);
    await viewerRole.addAssignedGames(this.getAllGames());

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
      this.civDevGroup.addAssignedRole(this.civEditorRole),
      this.civAdminGroup.addAssignedRole(civAdminRole),
    ]);

    await Promise.all([
      this.adminGroup.addAssignedUser(this.userCto),
      this.devopsGroup.addAssignedUser(this.userSrDev),
      this.qaGroup.addAssignedUser(this.userQA),
      this.civAdminGroup.addAssignedUser(this.userSrDev),
      this.civDevGroup.addAssignedUser(this.userJrDev),
    ]);
  }

  private async createResources() {
    this.gameXcom2 = await this.division.createGame({
      contentfulId: SampleDatabase.contentfulIds[0].game,
      bdsTitleId: 1000000,
    });
    this.gameWarOfChosen = await this.division.createGame({
      contentfulId: SampleDatabase.contentfulIds[1].game,
      bdsTitleId: 1000001,
    });
    this.gameCiv6 = await this.division.createGame({
      contentfulId: SampleDatabase.contentfulIds[2].game,
      bdsTitleId: 1000003,
    });
    this.gameGatheringStorm = await this.division.createGame({
      contentfulId: SampleDatabase.contentfulIds[3].game,
      bdsTitleId: 1000066,
    });
    this.gameRiseAndFall = await this.division.createGame({
      contentfulId: SampleDatabase.contentfulIds[4].game,
      bdsTitleId: 1000067,
    });

    // Branches for "real" games
    this.branchXcom = await this.gameXcom2.createBranchEntry({
      bdsBranchId: 4000000,
      visibility: 'public',
    });
    await this.gameXcom2.setDefaultBranch(this.branchXcom.id);

    this.branchWarOfChosen = await this.gameWarOfChosen.createBranchEntry({
      bdsBranchId: 4000003,
      visibility: 'public',
    });
    await this.gameWarOfChosen.setDefaultBranch(this.branchWarOfChosen.id);

    this.branchCiv6 = await this.gameCiv6.createBranchEntry({
      bdsBranchId: 4000001,
      visibility: 'public',
    });
    await this.gameCiv6.setDefaultBranch(this.branchCiv6.id);

    this.branchGatheringStorm = await this.gameGatheringStorm.createBranchEntry({
      bdsBranchId: 4000047,
      visibility: 'public',
    });
    await this.gameGatheringStorm.setDefaultBranch(this.branchGatheringStorm.id);

    this.branchRiseAndFall = await this.gameRiseAndFall.createBranchEntry({
      bdsBranchId: 4000048,
      visibility: 'public',
    });
    await this.gameRiseAndFall.setDefaultBranch(this.branchRiseAndFall.id);

    // Xcom builds
    const xcomBuild1 = await this.gameXcom2.createBuild({
      bdsBuildId: 2000000,
    });
    const xcomBuild2 = await this.gameXcom2.createBuild({
      bdsBuildId: 2000070,
    });
    const xcomBuild3 = await this.gameXcom2.createBuild({
      bdsBuildId: 2000071,
    });
    await this.branchXcom.addBuild(xcomBuild1);
    await this.branchXcom.addBuild(xcomBuild2);
    await this.branchXcom.addBuild(xcomBuild3);

    await this.gameXcom2.addName('XCOM 2 Super Game', Locale.en);
    await this.gameXcom2.addName('XCOM 2 Superpeli', Locale.fi);

    const xcomAgreement1 = await this.gameXcom2.createAgreementEntry({
      url: 'http://example.com/eula',
    });
    await xcomAgreement1.addName('Example Agreement One', Locale.en);
    await xcomAgreement1.addName('Example Agreement Uno', Locale.es);

    // War of the chosen builds
    const wocBuild1 = await this.gameWarOfChosen.createBuild({
      bdsBuildId: 2000004,
    });
    const wocBuild2 = await this.gameWarOfChosen.createBuild({
      bdsBuildId: 2000005,
    });
    const wocBuild3 = await this.gameWarOfChosen.createBuild({
      bdsBuildId: 2000010,
    });
    await this.branchWarOfChosen.addBuild(wocBuild1);
    await this.branchWarOfChosen.addBuild(wocBuild2);
    await this.branchWarOfChosen.addBuild(wocBuild3);

    // Civ6 builds
    this.civ6Build1 = await this.gameCiv6.createBuild({
      contentfulId: 'civ6TestBuild001',
      bdsBuildId: 2000001,
    });
    await this.branchCiv6.addBuild(this.civ6Build1);

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
  }
}
