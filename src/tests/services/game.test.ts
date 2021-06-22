import { mocked } from 'ts-jest/utils';
import { AuthenticateContext } from '../../models/auth/authenticatecontext';
import { PlayerContext } from '../../models/auth/playercontext';
import { getDBInstance } from '../../models/db/database';
import { GameModel } from '../../models/db/game';
import { HttpCode } from '../../models/http/httpcode';
import { GameService } from '../../services/game';
import { LicensingService } from '../../services/licensing';
import { PaginationContext } from '../../utils/pagination';
import { SampleDatabase } from '../../utils/sampledatabase';

jest.mock('../../services/licensing');

const mockedLicensingService = mocked(LicensingService);

describe('src/services/game', () => {
  const sampleDb = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await sampleDb.initAll();
  });

  describe('when the request is invalid', () => {
    it('should return not found without valid game', async () => {
      const playerContext = new PlayerContext('', '', '', null);

      const serviceResponse = await GameService.getGameDownloadModel(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.NOT_FOUND);
    });
  });

  describe('GameService.getAllPublicGames', () => {
    it('should return all games from sample database', async () => {
      const serviceResponse = await GameService.getAllPublicGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload).toHaveLength(SampleDatabase.creationData.gameContentfulIds.length);
      // Ensuring it provides the Public http model
      expect(serviceResponse.payload).not.toHaveProperty([0, 'defaultBranchId']);
    });

    it('should return no games if database is empty', async () => {
      await getDBInstance().sync({ force: true });
      const serviceResponse = await GameService.getAllPublicGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toHaveLength(0);
    });
  });

  describe('GameService.getAllPublisherGames', () => {
    it('should return all games from sample database', async () => {
      const serviceResponse = await GameService.getAllPublisherGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload?.items).toHaveLength(SampleDatabase.creationData.gameContentfulIds.length);
      // Ensuring it provides the Publisher http model
      expect(serviceResponse.payload?.items).toHaveProperty([0, 'defaultBranchId']);
    });

    it('should return no games if database is empty', async () => {
      await getDBInstance().sync({ force: true });
      const serviceResponse = await GameService.getAllPublisherGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload?.items).toHaveLength(0);
    });

    it('should return the properly paginated response', async () => {
      const pageCtx: PaginationContext = {
        from: 0,
        size: 2,
        sort: 'id',
      };
      const result = await GameService.getAllPublisherGames(pageCtx);
      expect(result.payload?.items).toHaveLength(pageCtx.size);
      expect(result.payload?.page).toHaveProperty('from', pageCtx.from);
      expect(result.payload?.page).toHaveProperty('total', 5);
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
    it('should return server error when missing game', async () => {
      const playerContext = new PlayerContext('', '', '', undefined);
      const serviceResponse = await GameService.getBranches(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.INTERNAL_SERVER_ERROR);
    });

    it('should return at least one branch for a game', async () => {
      const game = await GameModel.findOne({
        where: { contentfulId: SampleDatabase.creationData.gameContentfulIds[0] },
      });
      const playerContext = new PlayerContext('', '', '', game);
      const serviceResponse = await GameService.getBranches(playerContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload?.length).toBeGreaterThan(0);
    });
  });

  describe('GameService.getGames', () => {
    it('should return UNAUTHORIZED for an invalid/missing user', async () => {
      const ctx = new AuthenticateContext('', '', 'dev-login', {});
      expect(await GameService.getGamesPublisher(ctx)).toHaveProperty('code', 401);
    });

    it('should return a list of GameDescriptions that the publisher user has access to', async () => {
      const ctx = new AuthenticateContext('', SampleDatabase.creationData.debugAdminEmail, 'dev-login', {});
      const result = await GameService.getGamesPublisher(ctx);
      // This will likely change once we implement proper authentication
      expect(result).toHaveProperty('payload');
      expect(result.payload?.page).not.toBeUndefined();
      expect(result.payload?.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
          expect.objectContaining({ id: 3 }),
          expect.objectContaining({ id: 4 }),
          expect.objectContaining({ id: 5 }),
        ])
      );
    });
  });
});
