import { mocked } from 'ts-jest/utils';
import { UserContext } from '../../models/auth/usercontext';
import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { GameService } from '../../services/game';
import { SampleDatabase } from '../testutils';

jest.mock('../../models/auth/usercontext');

describe('src/services/game', () => {
  const sampleDb = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await sampleDb.initAll();
  });

  describe('GameService.getGameDownloadModel', () => {
    describe('when the user owns the game', () => {
      const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));
      userContext.checkIfTitleIsOwned.mockResolvedValue({ code: HttpCode.OK, payload: true });

      it('should return a valid game download model', async () => {
        const serviceResponse = await GameService.getGameDownloadModel(userContext, {
          contentfulId: SampleDatabase.contentfulIds[0].game,
        });
        expect(serviceResponse.code).toBe(HttpCode.OK);
        expect(serviceResponse.payload).toBeTruthy();
        expect(serviceResponse.payload?.names).toBeTruthy();
        expect(serviceResponse.payload?.agreements.length).toBeGreaterThan(0);
      });

      it('should return forbidden if a private or invalid branch is requested for an owned game', async () => {
        const serviceResponse = await GameService.getGameDownloadModel(
          userContext,
          { contentfulId: SampleDatabase.contentfulIds[0].game },
          12345134
        );
        expect(serviceResponse.code).toBe(HttpCode.FORBIDDEN);
      });
    });
  });

  describe('when the user does not own the game', () => {
    const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));
    userContext.checkIfTitleIsOwned.mockResolvedValueOnce({ code: HttpCode.OK, payload: false });

    it('should refuse the request', async () => {
      const serviceResponse = await GameService.getGameDownloadModel(userContext, {
        contentfulId: SampleDatabase.contentfulIds[0].game,
      });
      expect(serviceResponse.code).toBe(HttpCode.FORBIDDEN);
    });
  });

  describe('when the request is invalid', () => {
    const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));

    it('should return not found for invalid contentful id', async () => {
      const serviceResponse = await GameService.getGameDownloadModel(userContext, {
        contentfulId: 'random invalid value',
      });
      expect(serviceResponse.code).toBe(HttpCode.NOT_FOUND);
    });
  });

  describe('GameService.getAllGames', () => {
    it('should return all games from sample database', async () => {
      const serviceResponse = await GameService.getAllGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload?.items).toHaveLength(SampleDatabase.contentfulIds.length);
    });

    it('should return no games if database is empty', async () => {
      await getDBInstance().sync({ force: true });
      const serviceResponse = await GameService.getAllGames();
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload?.items).toHaveLength(0);
    });
  });

  describe('GameService.getOwnedGames', () => {
    const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));

    it('should return nothing if user owns no games', async () => {
      userContext.fetchOwnedTitles.mockResolvedValueOnce({
        code: HttpCode.OK,
        payload: [],
      });

      const serviceResponse = await GameService.getOwnedGames(userContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload?.model.downloadData).toBeTruthy();
      expect(Object.keys(serviceResponse.payload?.model.downloadData ?? {})).toHaveLength(0);
    });

    it('should return all games the user owns', async () => {
      userContext.fetchOwnedTitles.mockResolvedValueOnce({
        code: HttpCode.OK,
        payload: SampleDatabase.contentfulIds.map(item => {
          return {
            contentfulId: item.game,
          };
        }),
      });

      const serviceResponse = await GameService.getOwnedGames(userContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(Object.keys(serviceResponse.payload?.model.downloadData ?? {})).toHaveLength(
        SampleDatabase.contentfulIds.length
      );
    });
  });

  describe('GameService.getBranches', () => {
    const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));

    it('should return not found for invalid id', async () => {
      const serviceResponse = await GameService.getBranches({ contentfulId: 'random bad id' }, userContext);
      expect(serviceResponse.code).toBe(HttpCode.NOT_FOUND);
    });

    it('should return at least one branch for a game', async () => {
      userContext.fetchStudioUserModel.mockResolvedValueOnce(undefined);
      const serviceResponse = await GameService.getBranches(
        { contentfulId: SampleDatabase.contentfulIds[0].game },
        userContext
      );
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload?.length).toBeGreaterThan(0);
    });
  });
});
