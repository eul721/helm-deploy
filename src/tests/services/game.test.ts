import { mocked } from 'ts-jest/utils';
import { UserContext } from '../../models/auth/usercontext';
import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { GameService } from '../../services/game';
import { SampleDatabase } from '../testutils';
import { ContentfulGameModel } from '../../models/contentful/contentfulgamemodel';
import { ContentfulService } from '../../services/contentful';
import { ContentfulBranchModel } from '../../models/contentful/contentfulbranchmodel';

jest.mock('../../models/auth/usercontext');
jest.mock('../../services/contentful.ts');
ContentfulService.getGameModel = jest.fn().mockImplementation(
  async (contentfulGameModelId: string): Promise<ContentfulGameModel> => {
    return {
      agreements: [{ url: '', id: '', isEmbed: false, title: '' }],
      prerequisites: [{ id: '', title: '', bdsId: 1, commandLine: '', relativePath: '', required: true, version: '' }],
      childIds: [],
      name: 'mocked',
      publicReleaseBranch:
        SampleDatabase.contentfulIds.find(item => item.game === contentfulGameModelId)?.branch ??
        SampleDatabase.contentfulIds[0].game,
      supportedLanguages: [],
      parentId: null,
    };
  }
);
const mockContentfulBranchModel: ContentfulBranchModel = {
  isPublic: true,
  name: 'mock name',
  password: 'password',
};
ContentfulService.getBranchModel = jest.fn().mockResolvedValue(mockContentfulBranchModel);

describe('src/services/game', () => {
  const sampleDb = new SampleDatabase();

  beforeEach(async () => {
    await getDBInstance().sync({ force: true });
    await sampleDb.initAll();
  });

  describe('GameService.getGameDownloadModel', () => {
    describe('when the user owns the game', () => {
      const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));
      userContext.isTitleOwned.mockResolvedValue({ code: HttpCode.OK, payload: true });

      it('should return a valid game download model', async () => {
        const serviceResponse = await GameService.getGameDownloadModel(
          userContext,
          SampleDatabase.contentfulIds[0].game
        );
        expect(serviceResponse.code).toBe(HttpCode.OK);
        expect(serviceResponse.payload).toBeTruthy();
        expect(serviceResponse.payload?.name).toBeTruthy();
        expect(serviceResponse.payload?.agreements.length).toBeGreaterThan(0);
        expect(serviceResponse.payload?.prerequisites.length).toBeGreaterThan(0);
      });

      it('should return forbidden if a private or invalid branch is requested for an owned game', async () => {
        const serviceResponse = await GameService.getGameDownloadModel(
          userContext,
          SampleDatabase.contentfulIds[0].game,
          'fake branch id'
        );
        expect(serviceResponse.code).toBe(HttpCode.FORBIDDEN);
      });
    });
  });

  describe('when the user does not own the game', () => {
    const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));
    userContext.isTitleOwned.mockResolvedValueOnce({ code: HttpCode.OK, payload: false });

    it('should refuse the request', async () => {
      const serviceResponse = await GameService.getGameDownloadModel(userContext, SampleDatabase.contentfulIds[0].game);
      expect(serviceResponse.code).toBe(HttpCode.FORBIDDEN);
    });
  });

  describe('when the request is invalid', () => {
    const userContext = mocked(new UserContext(SampleDatabase.debugAdminEmail));

    it('should return not found for invalid contentful id', async () => {
      const serviceResponse = await GameService.getGameDownloadModel(userContext, 'random invalid value');
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
      userContext.getOwnedTitles.mockResolvedValueOnce({
        code: HttpCode.OK,
        payload: [],
      });

      const serviceResponse = await GameService.getOwnedGames(userContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload?.model.downloadData).toBeTruthy();
      expect(Object.keys(serviceResponse.payload?.model.downloadData ?? {})).toHaveLength(0);
    });

    it('should return all games the user owns', async () => {
      userContext.getOwnedTitles.mockResolvedValueOnce({
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
      const serviceResponse = await GameService.getBranches('random bad id', userContext);
      expect(serviceResponse.code).toBe(HttpCode.NOT_FOUND);
    });

    it('should return at least one branch for a game', async () => {
      userContext.getStudioUserModel.mockResolvedValueOnce(undefined);
      const serviceResponse = await GameService.getBranches(SampleDatabase.contentfulIds[0].game, userContext);
      expect(serviceResponse.code).toBe(HttpCode.OK);
      expect(serviceResponse.payload).toBeTruthy();
      expect(serviceResponse.payload?.length).toBeGreaterThan(0);
    });
  });
});
