import { mocked } from 'ts-jest/utils';
import { PlayerContext } from '../../models/auth/playercontext';
import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { GameService } from '../../services/game';
import { LicensingService } from '../../services/licensing';
import { SampleDatabase } from '../../utils/sampledatabase';

jest.mock('../../services/licensing');

const mockedLicensingService = mocked(LicensingService);

describe('src/services/game', () => {
  const sampleDb = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await sampleDb.initAll();
  });

  describe('GameService.getGameDownloadModel', () => {
    describe('when the user owns the game', () => {
      it('should return not found if a private or invalid branch is requested for an owned game', async () => {
        const playerContext = new PlayerContext(
          '',
          '',
          '',
          {
            contentfulId: SampleDatabase.creationData.gameContentfulIds[0],
          },
          { id: 12345134 }
        );
        const serviceResponse = await GameService.getGameDownloadModel(playerContext);
        expect(serviceResponse.code).toBe(HttpCode.NOT_FOUND);
      });
    });
  });

  describe('when the request is invalid', () => {
    it('should return not found for invalid contentful id', async () => {
      const playerContext = new PlayerContext('', '', '', {
        contentfulId: 'random invalid value',
      });

      const serviceResponse = await GameService.getGameDownloadModel(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.NOT_FOUND);
    });
  });

  describe('GameService.getAllGames', () => {
    it('should return all games from sample database', async () => {
      const serviceResponse = await GameService.getAllGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload).toHaveLength(SampleDatabase.creationData.gameContentfulIds.length);
    });

    it('should return no games if database is empty', async () => {
      await getDBInstance().sync({ force: true });
      const serviceResponse = await GameService.getAllGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toHaveLength(0);
    });
  });

  describe('GameService.getOwnedGames', () => {
    const playerContext = new PlayerContext('', '', '');

    it('should return nothing if user owns no games', async () => {
      mockedLicensingService.fetchLicenses.mockResolvedValueOnce({
        code: HttpCode.OK,
        payload: [],
      });

      const serviceResponse = await GameService.getOwnedGames(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload?.model.downloadData).toBeTruthy();
      expect(Object.keys(serviceResponse.payload?.model.downloadData ?? {})).toHaveLength(0);
    });

    it('should return all games the user owns', async () => {
      mockedLicensingService.fetchLicenses.mockResolvedValueOnce({
        code: HttpCode.OK,
        payload: SampleDatabase.creationData.gameContentfulIds,
      });

      const serviceResponse = await GameService.getOwnedGames(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(Object.keys(serviceResponse.payload?.model.downloadData ?? {})).toHaveLength(
        SampleDatabase.creationData.gameContentfulIds.length
      );
    });
  });

  describe('GameService.getBranches', () => {
    it('should return server error for invalid id', async () => {
      const playerContext = new PlayerContext('', '', '', { contentfulId: 'random bad id' });
      const serviceResponse = await GameService.getBranches(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.INTERNAL_SERVER_ERROR);
    });

    it('should return at least one branch for a game', async () => {
      const playerContext = new PlayerContext('', '', '', {
        contentfulId: SampleDatabase.creationData.gameContentfulIds[0],
      });
      const serviceResponse = await GameService.getBranches(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload?.length).toBeGreaterThan(0);
    });
  });
});
