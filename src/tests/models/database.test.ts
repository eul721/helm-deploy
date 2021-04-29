import { BranchModel } from '../../models/db/branch';
import { BuildModel } from '../../models/db/build';
import { getDBInstance } from '../../models/db/database';
import { DivisionModel } from '../../models/db/division';
import { GameModel } from '../../models/db/game';
import { GroupModel } from '../../models/db/group';
import { RoleModel } from '../../models/db/role';
import { UserModel } from '../../models/db/user';
import { SampleDatabase } from '../testutils';
import { error, info } from '../../logger';

describe('src/models/database', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
    await testDb.initAll();
  });

  it('should have defined methods', async () => {
    try {
      info(
        'testing one for each association to check that runtime-generated methods match the name-pattern written in the file'
      );

      expect(BranchModel.prototype.removeBuild).toBeDefined();
      expect(BranchModel.prototype.getOwner).toBeDefined();

      expect(BuildModel.prototype.getOwner).toBeDefined();

      expect(DivisionModel.prototype.createGame).toBeDefined();
      expect(DivisionModel.prototype.removeUser).toBeDefined();
      expect(DivisionModel.prototype.getGroups).toBeDefined();
      expect(DivisionModel.prototype.createRole).toBeDefined();

      expect(GameModel.prototype.createBuild).toBeDefined();
      expect(GameModel.prototype.createBranch).toBeDefined();
      expect(GameModel.prototype.getOwner).toBeDefined();
      expect(GameModel.prototype.getRolesWithGame).toBeDefined();

      expect(GroupModel.prototype.addAssignedRole).toBeDefined();
      expect(GroupModel.prototype.getAssignedUsers).toBeDefined();
      expect(GroupModel.prototype.getOwner).toBeDefined();

      expect(RoleModel.prototype.addAssignedPermission).toBeDefined();
      expect(RoleModel.prototype.removeAssignedGame).toBeDefined();
      expect(RoleModel.prototype.getOwner).toBeDefined();

      expect(UserModel.prototype.getOwner).toBeDefined();
    } catch (exc) {
      error(exc);
      throw exc;
    }
  });

  it('should have valid test data set', async () => {
    try {
      const division = await DivisionModel.findOne({
        where: { name: testDb.division?.name },
        include: [
          DivisionModel.associations.games,
          DivisionModel.associations.groups,
          DivisionModel.associations.roles,
          DivisionModel.associations.users,
        ],
      });
      expect(division).toBeTruthy();
      expect(division?.games?.length).toBeGreaterThan(0);
      expect(division?.groups?.length).toBeGreaterThan(0);
      expect(division?.roles?.length).toBeGreaterThan(0);
      expect(division?.users?.length).toBeGreaterThan(0);

      const game1 = await GameModel.findOne({
        where: { bdsTitleId: testDb.gameCiv?.bdsTitleId },
        include: GameModel.associations.owner,
      });
      expect(game1).toBeTruthy();
      const parentDiv1 = game1?.owner;

      const game2 = await GameModel.findOne({ where: { contentfulId: testDb.gameKerbel?.contentfulId } });
      expect(game2).toBeTruthy();
      const parentDiv2 = await game2?.getOwner();

      expect(parentDiv1?.id).toEqual(parentDiv2?.id);
      expect(parentDiv1).toBeTruthy();
    } catch (exc) {
      error(exc);
      throw exc;
    }
  });
});
