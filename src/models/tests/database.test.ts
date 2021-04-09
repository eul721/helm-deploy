import { getDBInstance } from '../db/database';

describe('src/models/database', () => {
  beforeEach(async () => {
    await getDBInstance().sync({ force: true, match: /_test$/ });
  });

  it('should initialize the database', async () => {
    await expect(async () => getDBInstance().sync()).not.toThrow();
  });
});
