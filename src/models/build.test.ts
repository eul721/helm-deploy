import { getDBInstance } from './database';
import { Build } from './build';

describe('src/models/branch', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
  });

  it('should initialize correctly', async () => {
    const firstResult = await Build.findAll();
    expect(firstResult).toHaveLength(0);
    await Build.create({
      contentfulId: 'test12345',
      titleId: 'testtitle',
    });
    const secondResult = await Build.findAll();
    expect(secondResult).toHaveLength(1);
  });
});
