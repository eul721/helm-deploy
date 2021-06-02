import { HttpCode } from '../../models/http/httpcode';
import { RbacService } from '../../services/rbac';
import { SampleDatabase } from '../../utils/sampledatabase';
import { getDBInstance } from '../../models/db/database';
import { UserContext } from '../../models/auth/usercontext';
import { error } from '../../logger';

jest.setTimeout(60 * 1000);

describe('src/services/rbacservice', () => {
  const testDb: SampleDatabase = new SampleDatabase();

  beforeAll(async () => {
    try {
      await getDBInstance().sync({ force: true });
      await testDb.initAll();
    } catch (err) {
      error('Failure initializing test suite, error=%s', err);
    }
  });

  describe('RbacService.hasDivisionPermission', () => {
    describe('for sample database admin with permissions only in his own division', () => {
      const userContext = new UserContext(SampleDatabase.creationData.debugAdminEmail, 'dev-login');

      it('should permit within correct division', async () => {
        const result = await RbacService.hasDivisionPermission(userContext, 'rbac-admin', testDb.division.id);
        expect(result.payload).toBe(true);
        expect(result.code).toBe(HttpCode.OK);
      });

      it('should forbid for wrong division', async () => {
        const result = await RbacService.hasDivisionPermission(userContext, 'rbac-admin', 12345);
        expect(result.payload).toBe(false);
        expect(result.code).toBe(HttpCode.OK);
      });

      it('should forbid for correct division but missing permission', async () => {
        const result = await RbacService.hasDivisionPermission(userContext, 't2-admin', testDb.division.id);
        expect(result.payload).toBe(false);
        expect(result.code).toBe(HttpCode.OK);
      });
    });
  });

  describe('RbacService.hasResourcePermission', () => {
    describe('for sample database admin with permissions only in his own division', () => {
      const userContext = new UserContext(SampleDatabase.creationData.debugAdminEmail, 'dev-login');

      it('should permit read', async () => {
        const result = await RbacService.hasResourcePermission(
          userContext,
          { contentfulId: testDb.gameCiv6.contentfulId },
          'read'
        );
        expect(result.code).toBe(HttpCode.OK);
        expect(result.payload).toBe(true);
      });

      it('should allow editing production resources', async () => {
        const result = await RbacService.hasRoleWithAllResourcePermission(
          userContext,
          { contentfulId: testDb.gameCiv6.contentfulId },
          ['update', 'change-production']
        );
        expect(result.code).toBe(HttpCode.OK);
        expect(result.payload).toBe(true);
      });
    });

    describe('for civ6 dev with permissions mainly for a single game', () => {
      let userContext: UserContext;

      beforeAll(async () => {
        userContext = new UserContext(testDb.userJrDev.externalId, 'dev-login');
      });

      it('should permit read', async () => {
        const result = await RbacService.hasResourcePermission(
          userContext,
          { contentfulId: testDb.gameCiv6.contentfulId },
          'update'
        );
        expect(result.code).toBe(HttpCode.OK);
        expect(result.payload).toBe(true);
      });

      it('should forbit editing production resources', async () => {
        const result = await RbacService.hasRoleWithAllResourcePermission(
          userContext,
          { contentfulId: testDb.gameCiv6.contentfulId },
          ['update', 'change-production']
        );
        expect(result.code).toBe(HttpCode.OK);
        expect(result.payload).toBe(false);
      });
    });
  });
});
