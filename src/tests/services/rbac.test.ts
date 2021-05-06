import { HttpCode } from '../../models/http/httpcode';
import { RbacService } from '../../services/rbac';
import { SampleDatabase } from '../testutils';
import { getDBInstance } from '../../models/db/database';

describe('src/services/rbacservice', () => {
  const testDb: SampleDatabase = new SampleDatabase();
  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await testDb.initAll();
  });

  describe('with valid input', () => {
    /* todo rbac service is mostly not implemented yet
    it('should allow access', async () => {
      const result = await RbacService.hasBdsAccess(
        testDb.userJrDev?.id ?? -1,
        testDb.gameCiv?.bdsTitleId ?? -1,
        'read'
      );
      expect(result.code).toBe(HttpCode.OK);
    });

    it('should forbid access', async () => {
      const result = await RbacService.hasBdsAccess(
        testDb.userJrDev?.id ?? -1,
        testDb.gameCiv?.bdsTitleId ?? -1,
        'update-production'
      );
      expect(result.code).toBe(HttpCode.FORBIDDEN);
    }); */

    it('should return not found on fictional user', async () => {
      const result = await RbacService.hasBdsAccess(999999, testDb.gameCiv6?.bdsTitleId ?? -1, 'read');
      expect(result.code).toBe(HttpCode.NOT_FOUND);
    });
  });
});
