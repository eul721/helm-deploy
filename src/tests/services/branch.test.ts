import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { SampleDatabase } from '../testutils';
import { BranchService } from '../../services/branch';

jest.mock('../../services/contentful.ts');

describe('src/services/branch', () => {
  const sampleDb = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await sampleDb.initAll();
  });
  describe('BranchService.onDeleted', () => {
    it('should return not found for invalid ids', async () => {
      const response = await BranchService.onDeleted(123456789, 987654321);
      expect(response.code).toBe(HttpCode.NOT_FOUND);
    });
  });

  // TODO add more after contentful refactor
});
