import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { SampleDatabase } from '../../utils/sampledatabase';
import { TitleService } from '../../services/title';

describe('src/services/title', () => {
  const sampleDb = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await sampleDb.initAll();
  });

  describe('TitleService.onDeleted', () => {
    it('should return not found for invalid id', async () => {
      const response = await TitleService.onDeleted(123456789);
      expect(response.code).toBe(HttpCode.NOT_FOUND);
    });
  });

  // TODO add more after contentful refactor
});
