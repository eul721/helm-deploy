import { BranchModel } from '../../models/db/branch';
import { BuildModel } from '../../models/db/build';
import { getDBInstance } from '../../models/db/database';
import { GameModel } from '../../models/db/game';

const Mocks = {
  Game1: {
    id: 12345,
    contentfulId: 'testgame12345',
    titleId: 54321,
  },
  Build1: {
    id: 23456,
    contentfulId: 'testbranch23456',
    buildId: 65432,
  },
};

describe('src/models/branch', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await GameModel.create({ bdsTitleId: Mocks.Game1.titleId, contentfulId: Mocks.Game1.contentfulId });
    await BuildModel.create({ bdsBuildId: Mocks.Build1.buildId, contentfulId: Mocks.Build1.contentfulId });
  });

  it('should initialize correctly', async () => {
    const firstResult = await BranchModel.findAll();
    expect(firstResult).toHaveLength(0);
    await BranchModel.create({
      contentfulId: 'test1234',
      bdsBranchId: 1234,
    });
    const secondResult = await BranchModel.findAll();
    expect(secondResult).toHaveLength(1);
  });
});
