import { BuildModel } from '../db/build';
import { getDBInstance } from '../db/database';

describe('src/models/branch', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  it('should initialize correctly', async () => {
    const firstResult = await BuildModel.findAll();
    expect(firstResult).toHaveLength(0);
    await BuildModel.create({
      contentfulId: 'test12345',
      bdsBuildId: 1234,
    });
    const secondResult = await BuildModel.findAll();
    expect(secondResult).toHaveLength(1);
  });
});
