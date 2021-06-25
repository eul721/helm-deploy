import { debug, info } from '../logger';
import { ResourceContext } from '../models/auth/resourcecontext';
import { AgreementModel } from '../models/db/agreement';
import { BranchModel } from '../models/db/branch';
import { BuildModel } from '../models/db/build';
import { DivisionModel } from '../models/db/division';
import { GameModel } from '../models/db/game';
import { AccountType, isOfAccountType, UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { BranchService } from '../services/branch';
import { BuildService } from '../services/build';
import { GameService } from '../services/game';
import { TitleService } from '../services/title';
import { reinitializeDummyData, SampleDatabase } from './sampledatabase';
import { DebuggerResponse, toDebuggerResponse } from './debuggerresponse';
import { getDBInstance } from '../models/db/database';
import { localeFromString } from './language';
import { toIntRequired } from './service';

export interface DebugAction {
  action: (params: string[]) => Promise<DebuggerResponse>;
  command: string;
  params: string[];
}

export function generateHelpText(actions: DebugAction[]): string[] {
  return ['Debugger console commands:'].concat(actions.map(action => `\t${action.command} ${action.params.join(' ')}`));
}

export const actions: DebugAction[] = [
  {
    command: 'help',
    params: [],
    action: async () => {
      return {
        code: 200,
        message: generateHelpText(actions),
      };
    },
  },
  // #region users
  {
    command: 'users list',
    params: [],
    action: async () => {
      const items = (await UserModel.findAll()).map(item => item.toHttpModel());
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  {
    command: 'users create',
    params: ['externalId', 'type'],
    action: async (params: string[]) => {
      const [externalId, typeInput] = params;
      const existing = await UserModel.findAll({ where: { externalId } });
      if (existing.length) {
        return {
          code: 400,
          message: `user(s) with externalId=${externalId} already exist. ids=${existing.map(user => user.id)}`,
        };
      }
      const accountType = typeInput as AccountType;
      if (!isOfAccountType(accountType)) {
        return {
          code: 400,
          message: `Provided account type=[${typeInput}] is invalid, must be one of: ['dev-login', '2K-dna']}`,
        };
      }
      const newUser = await UserModel.create({
        accountType,
        externalId,
      });
      if (!newUser) {
        return {
          code: 500,
          message: 'unhandled error creating user',
        };
      }
      return {
        code: 200,
        message: `user created: ${JSON.stringify(newUser.toHttpModel())}`,
      };
    },
  },
  {
    command: 'users delete',
    params: ['userId'],
    action: async (params: string[]) => {
      const [userId] = params;
      const user = await UserModel.findByPk(userId);
      if (!user) {
        return {
          code: 404,
          message: `user with pk=${userId} not found`,
        };
      }
      await user.destroy();
      return {
        code: 200,
        message: `user with pk=${userId} successfully deleted`,
      };
    },
  },
  // #endregion
  // #region title
  {
    command: 'title register',
    params: ['BDS_TITLE'],
    action: async (params: string[]) => {
      const division = await DivisionModel.findOne({ where: { name: SampleDatabase.creationData.divisionName } });
      const response = await TitleService.onCreated(division ?? new DivisionModel(), toIntRequired(params[0]));
      return {
        code: response.code,
        message: response.payload
          ? ['Created:', JSON.stringify(response.payload)]
          : ['Failed:', response.message ?? ''],
      };
    },
  },
  {
    command: 'title list',
    params: [],
    action: async () => {
      const items = (await GameModel.findAll()).map(item => item.toPublicHttpModel());
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  {
    command: 'title branches list',
    params: ['GAME_PK'],
    action: async (params: string[]) => {
      const game = await GameModel.findOne({ where: { id: params[0] } });
      if (!game?.branches) {
        return { code: HttpCode.NOT_FOUND, message: 'Failed to find the game' };
      }
      const context = new ResourceContext(game);
      return toDebuggerResponse(await GameService.getBranchesPublisher(context));
    },
  },
  {
    command: 'title set default branch',
    params: ['GAME_PK', 'BRANCH_PK'],
    action: async (params: string[]) => {
      const game = await GameModel.findOne({ where: { id: toIntRequired(params[0]) } });
      if (!game) {
        return { code: HttpCode.NOT_FOUND, message: 'Failed to find the game' };
      }
      const context = new ResourceContext(game);
      return toDebuggerResponse(await GameService.modifyGame(context, { defaultBranchPsId: params[1] }));
    },
  },
  {
    command: 'title set contentful id',
    params: ['GAME_PK', 'CONTENTFUL_ID'],
    action: async (params: string[]) => {
      const game = await GameModel.findOne({ where: { id: toIntRequired(params[0]) } });
      if (!game) {
        return { code: HttpCode.NOT_FOUND, message: 'Failed to find the game' };
      }
      const context = new ResourceContext(game);
      return toDebuggerResponse(await GameService.modifyGame(context, { contentfulId: params[1] }));
    },
  },
  {
    command: 'title add name',
    params: ['GAME_PK', 'NAME', '[locale="en"]'],
    action: async (params: string[]) => {
      const [gameId, name, localeStr = 'en'] = params;
      const game = await GameModel.findOne({ where: { id: gameId } });
      if (!game) {
        return { code: HttpCode.NOT_FOUND, message: 'Failed to find the game' };
      }
      const locale = localeFromString(localeStr);
      if (!locale) {
        return {
          code: 400,
          message: `Bad locale value=${localeStr}`,
        };
      }
      await game.addName(name, locale);
      return {
        code: 200,
        message: 'Added',
      };
    },
  },
  {
    command: 'title eula list',
    params: ['GAME_PK'],
    action: async (params: string[]) => {
      const [gameId] = params;
      debug('Listing eulas for game=%s', gameId);
      const agreements = await AgreementModel.findAll({
        where: { ownerId: gameId },
        include: { all: true },
      });
      if (!agreements || !agreements.length) {
        return { code: 404, message: `No agreements for title pk=${gameId} not found` };
      }
      return {
        code: 200,
        message: [
          `Agreements for titleId=${gameId}`,
          ...(agreements.map(
            agreement =>
              `agreementId=${agreement.id} names: "${JSON.stringify(agreement.names)}" urls: ${JSON.stringify(
                agreement.urls
              )}`
          ) ?? []),
        ],
      };
    },
  },
  {
    command: 'title eula add',
    params: ['GAME_PK', '"EULA Title"', 'URL', '[locale="en"]'],
    action: async (params: string[]) => {
      const [gameId, title, url, localeStr = 'en'] = params;
      debug('Adding EULA to title id=%s name="%s" url=%s', gameId, title, url);
      // Add a EULA for a game
      const game = await GameModel.findByPk(gameId);
      if (!game) {
        return { code: 404, message: `No title found with pk=${gameId}` };
      }
      const locale = localeFromString(localeStr);
      if (!locale) {
        return {
          code: 400,
          message: `Bad locale value=${localeStr}`,
        };
      }
      const newAgreement = await game.createAgreementEntry({});
      await newAgreement.addName(title, locale);
      await newAgreement.addUrl(url, locale);
      await newAgreement.reload({ include: { all: true } });
      return {
        code: 201,
        message: `Added agreementId=${newAgreement.id} with name="${newAgreement.names[locale]}" and url=${newAgreement.urls[locale]} to gameId=${gameId}`,
      };
    },
  },
  {
    command: 'title eula update',
    params: ['GAME_PK', 'AGREEMENT_PK', '"EULA Title"', 'URL', '[locale="en"]'],
    action: async (params: string[]) => {
      const [gameId, agreementId, title, url, localeStr = 'en'] = params;
      const game = await GameModel.findByPk(gameId, { include: { all: true } });
      if (!game) {
        return {
          code: 404,
          message: `No title found with pk=${gameId}`,
        };
      }
      const agreement = await AgreementModel.findByPk(agreementId, { include: { all: true } });
      if (!agreement) {
        return {
          code: 404,
          message: `No agreement found with pk=${agreementId}`,
        };
      }
      if (!game.agreements?.some(ag => ag.id === agreement.id)) {
        return {
          code: 400,
          message: `Title=${game.id} does not own agreement=${agreement.id}`,
        };
      }
      const locale = localeFromString(localeStr);
      if (!locale) {
        return {
          code: 400,
          message: `Bad locale value=${localeStr}`,
        };
      }
      await agreement.addName(title, locale);
      await agreement.addUrl(url, locale);
      await agreement.reload({ include: { all: true } });
      return {
        code: 200,
        message: `Updated titleId=${gameId} agreementId=${agreement.id} title=${agreement.names[locale]} url=${agreement.urls[locale]} locale=${locale}`,
      };
    },
  },
  {
    command: 'title eula remove',
    params: ['GAME_PK', 'AGREEMENT_ID'],
    action: async (params: string[]) => {
      const [gameId, agreementId] = params;
      const game = await GameModel.findByPk(gameId, { include: { all: true } });
      if (!game) {
        return {
          code: 404,
          message: `Game with id=${gameId} not found`,
        };
      }
      const agreement = await AgreementModel.findByPk(agreementId);
      if (!agreement) {
        return {
          code: 404,
          message: `Could not find agreementId=${agreementId}`,
        };
      }
      if (!game.agreements?.some(ag => ag.id === agreement.id)) {
        return {
          code: 400,
          message: `titleId=${game.id} does not contain agreementId=${agreement.id}`,
        };
      }
      await game.removeAgreement(agreement);
      await agreement.destroy();

      return {
        code: 200,
        message: `Removed agreementId=${agreementId} from titleId=${gameId}`,
      };
    },
  },
  // #endregion
  // #region branch
  {
    command: 'branch register',
    params: ['BDS_TITLE', 'BDS_BRANCH'],
    action: async (params: string[]) => {
      const response = await BranchService.onCreated(toIntRequired(params[0]), toIntRequired(params[1]));
      return toDebuggerResponse(response);
    },
  },
  {
    command: 'branch list',
    params: [],
    action: async () => {
      const items = (await BranchModel.findAll()).map(item => item.toPublicHttpModel());
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  {
    command: 'branch set password',
    params: ['BRANCH_PK', 'PASSWORD'],
    action: async (params: string[]) => {
      const [id, password] = params;
      const branch = await BranchModel.findOne({ where: { id } });
      if (!branch) {
        return { code: 404, message: 'Failed to find branch to modify' };
      }
      branch.password = password;
      await branch.save();
      return {
        code: 200,
        message: 'OK',
      };
    },
  },
  {
    command: 'branch set build',
    params: ['BDS_BRANCH', 'BDS_BUILD'],
    action: async (params: string[]) => {
      const response = await BranchService.onModified(undefined, toIntRequired(params[0]), toIntRequired(params[1]));
      return { code: response.code, message: response.code === 200 ? 'OK' : 'Failed' };
    },
  },
  {
    command: 'branch version history',
    params: ['BRANCH_PK'],
    action: async (params: string[]) => {
      const [id] = params;
      const branch = await BranchModel.findOne({ where: { id }, include: BranchModel.associations.builds });
      if (!branch?.builds) {
        return { code: 404, message: 'Failed to find branch' };
      }
      return {
        code: 200,
        message: branch.builds.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  // #endregion
  // #region build
  {
    command: 'build register',
    params: ['BDS_TITLE', 'BDS_BUILD'],
    action: async (params: string[]) => {
      const response = await BuildService.onCreated(toIntRequired(params[0]), toIntRequired(params[1]));
      return toDebuggerResponse(response);
    },
  },
  {
    command: 'build list',
    params: [],
    action: async () => {
      const items = (await BuildModel.findAll()).map(item => item.toPublisherHttpModel());
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  // #endregion
  {
    command: 'drop database',
    params: ['SECRET_KEY'],
    action: async (params: string[]) => {
      if (params[0] !== 'chrząszcz-brzmi-w-trzcinie') {
        return {
          code: HttpCode.BAD_REQUEST,
          message: [
            '\tNNNNNNNN........NNNNNNNN.....OOOOOOOOO.....',
            '\tN#######N.......N######N...OO#########OO...',
            '\tN########N......N######N.OO#############OO.',
            '\tN#########N.....N######NO#######OOO#######O',
            '\tN##########N....N######NO######O...O######O',
            '\tN###########N...N######NO#####O.....O#####O',
            '\tN#######N####N..N######NO#####O.....O#####O',
            '\tN######N.N####N.N######NO#####O.....O#####O',
            '\tN######N..N####N#######NO#####O.....O#####O',
            '\tN######N...N###########NO#####O.....O#####O',
            '\tN######N....N##########NO#####O.....O#####O',
            '\tN######N.....N#########NO######O...O######O',
            '\tN######N......N########NO#######OOO#######O',
            '\tN######N.......N#######N.OO#############OO.',
            '\tN######N........N######N...OO#########OO...',
            '\tNNNNNNNN.........NNNNNNN.....OOOOOOOOO.....',
          ],
        };
      }
      info('About to drop and redo db');
      const sq = await getDBInstance().sync({ force: true, match: /_dev$/ });
      info('Sync done');
      await sq.authenticate();
      info('Auth done');
      await reinitializeDummyData();
      info('Dumme data done');
      return {
        code: 200,
        message: 'DONE',
      };
    },
  },
];

export async function executeAction(input: string): Promise<DebuggerResponse> {
  try {
    const matchingAction = actions.find(action => input.startsWith(action.command));
    if (!matchingAction) {
      return { code: 400, message: ['No matching action found'].concat(generateHelpText(actions)) };
    }

    const paramsSection =
      input.length > matchingAction.command.length ? input.substr(matchingAction.command.length + 1) : '';
    const params = (paramsSection.length > 0 ? paramsSection.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [] : []).map(param => {
      if (param.startsWith('"') && param.endsWith('"')) {
        return param.substr(1, param.length - 2);
      }
      return param;
    });

    if (params.length !== matchingAction.params.length) {
      return {
        code: 400,
        message: [
          `Wrong number of parameters for action ${matchingAction.command}, expected ${matchingAction.params.length}, got ${params.length}`,
        ].concat(generateHelpText(actions)),
      };
    }

    return matchingAction.action(params);
  } catch (err) {
    return { code: HttpCode.INTERNAL_SERVER_ERROR, message: `Exception ${err} while processing request` };
  }
}
