import { getDBInstance } from './database';
import { Build } from './build';
import { Game } from './game';
import { Branch } from './branch';

const Mocks = {
  Game1: {
    id: 12345,
    contentfulId: 'testgame12345',
    titleId: 'bds-test-title-id-1',
  },
  Build1: {
    id: 23456,
    contentfulId: 'testbranch23456',
    buildId: 'bds-test-build-id-1',
  },
};

describe('src/models/branch', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await Game.create(Mocks.Game1);
    await Build.create(Mocks.Build1);
  });

  it('should initialize correctly', async () => {
    const firstResult = await Branch.findAll();
    expect(firstResult).toHaveLength(0);
    await Branch.create({
      contentfulId: 'test1234',
      gameId: Mocks.Game1.id,
      branchId: 'testbranchid',
      buildId: Mocks.Build1.id,
    });
    const secondResult = await Branch.findAll();
    expect(secondResult).toHaveLength(1);
  });

  it('should respect null constraints', async () => {
    // Empty
    await expect(Branch.create({})).rejects.toMatchObject({
      name: /notnull violation/i,
    });

    // violates buildId constraint
    await expect(
      Branch.create({
        gameId: Mocks.Game1.id,
      })
    ).rejects.toMatchObject({
      name: /notnull violation/i,
    });

    // violates gameId constraint
    await expect(
      Branch.create({
        buildId: Mocks.Build1.id,
      })
    ).rejects.toMatchObject({
      name: /notnull violation/i,
    });
  });

  it('should respect foreign key constraints', async () => {
    // Violate gameId FK
    await expect(
      Branch.create({
        contentfulId: 'testabcd',
        gameId: 'not-an-existing-one',
        buildId: Mocks.Build1.id,
      })
    ).rejects.toMatchObject({
      name: /foreign key/i,
    });

    // Violate branchId FK
    await expect(
      Branch.create({
        contentfulId: 'testabcd',
        gameId: Mocks.Game1.id,
        buildId: 'not-an-existing-one',
      })
    ).rejects.toMatchObject({
      name: /foreign key/i,
    });
  });
});
