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

  public static readonly creationData = {
    gameContentfulIds: [
      '6sAfVxoGuShx9DV38DcFxI',
      '5Apf8DiUW6dVyqmwjytKzf',
      '6MjdXYJ6dk2kxSXh0C0H60',
      '5r3Loln4BEezgXtidiCxHm',
      'tz1zm9ktk7RtSTH6STkhG',
    ],
    debugAdminEmail: 'debug@admin',
    divisionName: 't2',
    groupNames: ['viewers', 'civ devs', 'civ admin', 'devops', 'admins'],
  };

  public initAll = async () => {
    try {
      this.permissions = await Promise.all(DivisionPermissions.map(async id => PermissionModel.create({ id })));
      this.permissions = await Promise.all(ResourcePermissions.map(async id => PermissionModel.create({ id })));

      await DivisionModel.create({ name: 'empty div' });
      this.division = await DivisionModel.create({ name: SampleDatabase.creationData.divisionName });

      // Games that relate to test data in BDS and real Contentful IDs
      await this.createResources();

      // users setup
      [this.userCto, this.userSrDev, this.userJrDev, this.userQA, this.userGuest] = await Promise.all([
        this.division.createUserEntry({
          externalId: SampleDatabase.creationData.debugAdminEmail,
          accountType: 'dev-login',
        }),
        this.division.createUserEntry({
          externalId: 'teddanson@thegood.place',
          accountType: 'dev-login',
        }),
        this.division.createUserEntry({
          externalId: 'julia@vice.president',
          accountType: 'dev-login',
        }),
        this.division.createUserEntry({
          externalId: 'test@user',
          accountType: 'dev-login',
        }),
        this.division.createUserEntry({
          externalId: 'guest@user',
          accountType: 'dev-login',
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

    this.qaGroup = await this.division.createGroupEntry({ name: SampleDatabase.creationData.groupNames[0] });
    this.civDevGroup = await this.division.createGroupEntry({ name: SampleDatabase.creationData.groupNames[1] });
    this.civAdminGroup = await this.division.createGroupEntry({ name: SampleDatabase.creationData.groupNames[2] });
    this.devopsGroup = await this.division.createGroupEntry({ name: SampleDatabase.creationData.groupNames[3] });
    this.adminGroup = await this.division.createGroupEntry({ name: SampleDatabase.creationData.groupNames[4] });

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
      contentfulId: SampleDatabase.creationData.gameContentfulIds[0],
      bdsTitleId: 9991000000,
    });
    this.gameWarOfChosen = await this.division.createGame({
      contentfulId: SampleDatabase.creationData.gameContentfulIds[1],
      bdsTitleId: 9991000001,
    });
    this.gameCiv6 = await this.division.createGame({
      contentfulId: SampleDatabase.creationData.gameContentfulIds[2],
      bdsTitleId: 9991000003,
    });
    this.gameGatheringStorm = await this.division.createGame({
      contentfulId: SampleDatabase.creationData.gameContentfulIds[3],
      bdsTitleId: 9991000066,
    });
    this.gameRiseAndFall = await this.division.createGame({
      contentfulId: SampleDatabase.creationData.gameContentfulIds[4],
      bdsTitleId: 9991000067,
    });

    // Branches for "real" games
    this.branchXcom = await this.gameXcom2.createBranchEntry({
      bdsBranchId: 9994000000,
    });
    await this.gameXcom2.setDefaultBranch(this.branchXcom.id);
    await this.gameXcom2.createBranchEntry({
      bdsBranchId: 9994444444,
    });

    this.branchWarOfChosen = await this.gameWarOfChosen.createBranchEntry({
      bdsBranchId: 9994000003,
    });
    await this.gameWarOfChosen.setDefaultBranch(this.branchWarOfChosen.id);

    this.branchCiv6 = await this.gameCiv6.createBranchEntry({
      bdsBranchId: 9994000001,
    });
    await this.gameCiv6.setDefaultBranch(this.branchCiv6.id);

    this.branchGatheringStorm = await this.gameGatheringStorm.createBranchEntry({
      bdsBranchId: 9994000047,
    });
    await this.gameGatheringStorm.setDefaultBranch(this.branchGatheringStorm.id);

    this.branchRiseAndFall = await this.gameRiseAndFall.createBranchEntry({
      bdsBranchId: 9994000048,
    });
    await this.gameRiseAndFall.setDefaultBranch(this.branchRiseAndFall.id);

    // Xcom builds
    const xcomBuild1 = await this.gameXcom2.createBuild({
      bdsBuildId: 9992000000,
    });
    const xcomBuild2 = await this.gameXcom2.createBuild({
      bdsBuildId: 9992000070,
    });
    const xcomBuild3 = await this.gameXcom2.createBuild({
      bdsBuildId: 9992000071,
    });
    await this.branchXcom.addBuild(xcomBuild1);
    await this.branchXcom.addBuild(xcomBuild2);
    await this.branchXcom.addBuild(xcomBuild3);

    await this.gameXcom2.addName('XCOM 2 Super Game', Locale.en);
    await this.gameXcom2.addName('XCOM 2 Superpeli', Locale.fi);

    // War of the chosen builds
    const wocBuild1 = await this.gameWarOfChosen.createBuild({
      bdsBuildId: 9992000004,
    });
    const wocBuild2 = await this.gameWarOfChosen.createBuild({
      bdsBuildId: 9992000005,
    });
    const wocBuild3 = await this.gameWarOfChosen.createBuild({
      bdsBuildId: 9992000010,
    });
    await this.branchWarOfChosen.addBuild(wocBuild1);
    await this.branchWarOfChosen.addBuild(wocBuild2);
    await this.branchWarOfChosen.addBuild(wocBuild3);

    // Civ6 builds
    this.civ6Build1 = await this.gameCiv6.createBuild({
      contentfulId: 'civ6TestBuild001',
      bdsBuildId: 9992000001,
    });
    await this.branchCiv6.addBuild(this.civ6Build1);

    // Gathering Storm builds
    const gatheringStormBuild1 = await this.gameGatheringStorm.createBuild({
      contentfulId: 'gatheringStormTestBuild001',
      bdsBuildId: 9992000073,
    });
    await this.branchGatheringStorm.addBuild(gatheringStormBuild1);

    // Rise and Fall builds
    const riseAndFallBuild1 = await this.gameRiseAndFall.createBuild({
      contentfulId: 'riseAndFallTestBuild001',
      bdsBuildId: 9992000074,
    });
    await this.branchRiseAndFall.addBuild(riseAndFallBuild1);

    // Agreements
    const xcomAgreement1 = await this.gameXcom2.createAgreementEntry({
      url: 'http://example.com/eula',
    });
    await xcomAgreement1.addName('Example Agreement One', Locale.en);
    await xcomAgreement1.addName('Example Agreement Uno', Locale.es);

    const civ6Agreement = await this.gameCiv6.createAgreementEntry({
      url: 'http://civ6.com/eula',
    });
    await civ6Agreement.addName('Example Agreement One', Locale.en);
    await civ6Agreement.addName('Example Agreement Uno', Locale.es);
  }
}
