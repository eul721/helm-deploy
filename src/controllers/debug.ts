import { Router } from 'express';
import { debug } from '../logger';
import { AgreementModel } from '../models/db/agreement';
import { GameModel } from '../models/db/game';
import { Locale } from '../models/db/localizedfield';
import { UserModel } from '../models/db/user';

/**
 * This test is purely for debugging. It is NOT intended to service any user-facing
 * endpoints.
 *
 * This router must never be exposed to public, may be removed when a proper Portal API
 * is implemented.
 */
export const debugApiRouter = Router();

interface DebuggerResponse {
  // HTTP Response code
  code: number;
  // String message
  message: string | string[];
}

function generateHelpText(): string[] {
  return [
    'Debugger console commands:',
    '\tlist titles',
    '\tlist users',
    '\t',
    '\ttitle eula add GAME_PK "English EULA Title" http://url.com',
    '\ttitle eula list GAME_PK',
  ];
}

async function listHandler(args: string[]): Promise<DebuggerResponse> {
  debug('List action found, args:', args);
  if (!args.length) {
    // Print help text
    return {
      code: 200,
      message: 'Usage:\nlist (titles|builds|branches|users)',
    };
  }
  const [target] = args;
  switch (target) {
    case 'titles': {
      const games = await GameModel.findAll({ include: { all: true } });
      return {
        code: 200,
        message: [
          `Found ${games.length} games`,
          ...(games.map(
            (gameItem, idx) =>
              `${idx}: id: ${gameItem.id} name: ${gameItem.names[Locale.en]} bdsId: ${
                gameItem.bdsTitleId
              } - contentfulId: ${gameItem.contentfulId}`
          ) ?? []),
        ],
      };
    }
    case 'users': {
      const users = await UserModel.findAll();
      return {
        code: 200,
        message: [
          `Found ${users.length} users`,
          ...(users.map((userItem, idx) => `${idx}: userId: ${userItem.id} externalId: ${userItem.externalId}`) ?? []),
        ],
      };
    }
    case 'builds':
    case 'branches':
    default:
      return {
        code: 400,
        message: `unsupported field ${target}`,
      };
  }
}

async function titleHandler(args: string[]): Promise<DebuggerResponse> {
  debug('title action found, args:', args);
  if (!args.length) {
    // Print help text
    return {
      code: 200,
      message: ['Usage:\neula ACTION ...params\n', '\tlist gameId', '\tadd gameId"Name In English" url'],
    };
  }

  const [target, ..._rest] = args;
  switch (target) {
    case 'eula': {
      const [action, gameId, ..._eulaRest] = _rest;
      switch (action) {
        case 'list': {
          // List EULAs for game
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
        }
        case 'add': {
          const [title, url] = _eulaRest;
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
            message: `Added agreementId=${newAgreement.id} with name="${newAgreement.names[Locale.en]} and url=${
              newAgreement.url
            } to gameId=${gameId}`,
          };
        }
        default:
          return {
            code: 400,
            message: 'invalid input',
          };
      }
    }
    default:
      return {
        code: 400,
        message: 'invalid input',
      };
  }
}

async function processCommand(cmd: string): Promise<DebuggerResponse> {
  const [action, ...rest] = cmd
    .split(/("[^"]+")|[\s]+/)
    .filter(item => item)
    .map(item => item.replace(/"/g, '').trim())
    .filter(item => item);

  let result: DebuggerResponse = {
    code: 400,
    message: 'bad input',
  };

  switch (action) {
    case 'list':
      result = await listHandler(rest);
      break;
    case 'title':
      result = await titleHandler(rest);
      break;
    default:
      result.message = generateHelpText();
      break;
  }
  return result;
}

debugApiRouter.post('/', async (req, res) => {
  debug('Body:', req.body);
  const { command } = req.body;
  const cmdResult = await processCommand(command);
  res.status(cmdResult.code).json({ message: cmdResult.message });
});
