import { debug, info } from '../logger';
import { ResourceContext } from '../models/auth/resourcecontext';
import { AgreementModel } from '../models/db/agreement';
import { BranchModel } from '../models/db/branch';
import { BuildModel } from '../models/db/build';
import { DivisionModel } from '../models/db/division';
import { GameModel } from '../models/db/game';
import { Locale } from '../models/db/localizedfield';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { BranchService } from '../services/branch';
import { BuildService } from '../services/build';
import { GameService } from '../services/game';
import { TitleService } from '../services/title';
import { SampleDatabase } from './sampledatabase';
import { DebuggerResponse, toDebuggerResponse } from './debuggerresponse';
import { getDBInstance } from '../models/db/database';
import { reinitializeDummyData } from '..';

export interface DebugAction {
  command: string;
  params: string[];
  action: (params: string[]) => Promise<DebuggerResponse>;
}

export function generateHelpText(actions: DebugAction[]): string[] {
  return ['Debugger console commands:'].concat(actions.map(action => `\t${action.command} ${action.params.join(' ')}`));
}

export const actions: DebugAction[] = [
  {
    command: 'users list',
    params: [],
    action: async (_params: string[]) => {
      const items = (await UserModel.findAll()).map(item => item.toHttpModel());
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  {
    command: 'help',
    params: [],
    action: async (_params: string[]) => {
      return {
        code: 200,
        message: generateHelpText(actions),
      };
    },
  },
  {
    command: 'title register',
    params: ['BDS_TITLE'],
    action: async (params: string[]) => {
      const division = await DivisionModel.findOne({ where: { name: SampleDatabase.creationData.divisionName } });
      const response = await TitleService.onCreated(division ?? new DivisionModel(), Number.parseInt(params[0], 10));
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
    action: async (_params: string[]) => {
      const items = (await GameModel.findAll()).map(item => item.toHttpModel());
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  {
    command: 'title set default branch',
    params: ['GAME_PK', 'BRANCH_PK'],
    action: async (params: string[]) => {
      const context = new ResourceContext(Number.parseInt(params[0], 10), Number.parseInt(params[1], 10));
      return toDebuggerResponse(await GameService.setMainBranch(context));
    },
  },
  {
    command: 'title set contentful id',
    params: ['GAME_PK', 'CONTENTFULL_ID'],
    action: async (params: string[]) => {
      const context = new ResourceContext(Number.parseInt(params[0], 10));
      return toDebuggerResponse(await GameService.setContentfulId(context, params[1]));
    },
  },
  {
    command: 'title add name',
    params: ['GAME_PK', 'NAME'],
    action: async (params: string[]) => {
      const game = await GameModel.findOne({ where: { id: params[0] } });
      if (!game) {
        return { code: HttpCode.NOT_FOUND, message: 'Failed to find the game' };
      }
      await game.addName(params[1], Locale.en);
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
      const gameId = params[0];
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
        message: agreements.map(agreement => `name: "${agreement.names[Locale.en]}" url: ${agreement.url}`) ?? [],
      };
    },
  },
  {
    command: 'title eula add',
    params: ['GAME_PK', '"English EULA Title"', 'URL'],
    action: async (params: string[]) => {
      const [gameId, title, url] = params;
      debug('Adding EULA to title id=%s name="%s" url=%s', gameId, title, url);
      // Add a EULA for a game
      const game = await GameModel.findByPk(gameId);
      if (!game) {
        return { code: 404, message: `No title found with pk=${gameId}` };
      }
      const newAgreement = await game.createAgreementEntry({
        url,
      });
      await newAgreement.addName(title, Locale.en);
      await newAgreement.reload({ include: { all: true } });
      return {
        code: 201,
        message: `Added agreementId=${newAgreement.id} with name="${newAgreement.names[Locale.en]}" and url=${
          newAgreement.url
        } to gameId=${gameId}`,
      };
    },
  },
  {
    command: 'branch register',
    params: ['BDS_TITLE', 'BDS_BRANCH'],
    action: async (params: string[]) => {
      const response = await BranchService.onCreated(Number.parseInt(params[0], 10), Number.parseInt(params[1], 10));
      return toDebuggerResponse(response);
    },
  },
  {
    command: 'branch list',
    params: [],
    action: async (_params: string[]) => {
      const items = (await BranchModel.findAll()).map(item => item.toHttpModel(Locale.en));
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
    params: ['BRANCH_PK', 'BUILD_PK'],
    action: async (params: string[]) => {
      const branch = await BranchModel.findOne({ where: { id: params[0] } });
      if (!branch) {
        return { code: 404, message: 'Failed to find branch to modify' };
      }
      const response = await BranchService.onModified(undefined, branch.bdsBranchId, Number.parseInt(params[0], 10));
      return { code: response.code, message: response.code === 200 ? 'OK' : 'Failed' };
    },
  },
  {
    command: 'build register',
    params: ['BDS_TITLE', 'BDS_BUILD'],
    action: async (params: string[]) => {
      const response = await BuildService.onCreated(Number.parseInt(params[0], 10), Number.parseInt(params[1], 10));
      return toDebuggerResponse(response);
    },
  },
  {
    command: 'build list',
    params: [],
    action: async (_params: string[]) => {
      const items = (await BuildModel.findAll()).map(item => item.toHttpModel(Locale.en));
      return {
        code: 200,
        message: items.map(item => `\t${JSON.stringify(item)}`),
      };
    },
  },
  {
    command: 'drop database',
    params: [],
    action: async (_params: string[]) => {
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
