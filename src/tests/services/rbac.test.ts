import { HttpCode } from '../../models/http/httpcode';
import { RbacService } from '../../services/rbac/basic';
import { SampleDatabase } from '../../utils/sampledatabase';
import { getDBInstance } from '../../models/db/database';

jest.setTimeout(60 * 1000);

describe('src/services/rbacservice', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeAll(async () => {
    await getDBInstance().sync({ force: true });
    await testDb.initAll();
  });

  describe('RbacService.hasDivisionPermission', () => {
    describe('for sample database admin with permissions only in his own division', () => {
      it('should permit within correct division', async () => {
        const result = await RbacService.hasDivisionPermission(testDb.userCto, 'rbac-admin', testDb.division.id);
        expect(result.code).toBe(HttpCode.OK);
      });

      it('should forbid for wrong division', async () => {
        const result = await RbacService.hasDivisionPermission(testDb.userCto, 'rbac-admin', 12345);
        expect(result.code).toBe(HttpCode.FORBIDDEN);
      });

      it('should forbid for correct division but missing permission', async () => {
        const result = await RbacService.hasDivisionPermission(testDb.userCto, 't2-admin', testDb.division.id);
        expect(result.code).toBe(HttpCode.FORBIDDEN);
      });
    });
  });

  describe('RbacService.hasResourcePermission', () => {
    describe('for sample database admin with permissions only in his own division', () => {
      it('should permit read', async () => {
        const result = await RbacService.hasResourcePermission(
          testDb.userCto.id,
          { contentfulId: testDb.gameCiv6.contentfulId },
          'read'
        );
        expect(result.code).toBe(HttpCode.OK);
      });

      it('should allow editing production resources', async () => {
        const result = await RbacService.hasRoleWithAllResourcePermission(
          testDb.userCto.id,
          { contentfulId: testDb.gameCiv6.contentfulId },
          ['update', 'change-production']
        );
        expect(result.code).toBe(HttpCode.OK);
      });
    });

    describe('for civ6 dev with permissions mainly for a single game', () => {
      it('should permit read', async () => {
        const result = await RbacService.hasResourcePermission(
          testDb.userJrDev.id,
          { contentfulId: testDb.gameCiv6.contentfulId },
          'update'
        );
        expect(result.code).toBe(HttpCode.OK);
      });

      it('should forbit editing production resources', async () => {
        const result = await RbacService.hasRoleWithAllResourcePermission(
          testDb.userJrDev.id,
          { contentfulId: testDb.gameCiv6.contentfulId },
          ['update', 'change-production']
        );
        expect(result.code).toBe(HttpCode.FORBIDDEN);
      });
    });
  });
});
