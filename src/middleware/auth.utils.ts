import { DNA, DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import retry from 'async-retry';
import * as JWT from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { TokenValidationResult } from '../models/auth/tokenvalidationresult';
import { config } from '../config';
import { error, info, warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { UserModel } from '../models/db/user';
import { PublisherTokenIssuer } from '../services/devtokengenerator';

const NUM_DNA_VERIFY_ATTEMPTS = 3;

/**
 * Type defining middleware
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Constant used to identify authentication token
 */
export const HTTP_AUTH_HEADER_TOKEN = 'Authorization';

/**
 * Constant used to identify webhook secret token
 */
export const HTTP_WEBHOOK_HEADER_TOKEN = 'x-shared-secret';

export function useDummyAuth(): boolean {
  return (config.isDev() && config.ALLOW_UNAUTHORIZED === 'true') || config.isTest();
}

export const dummyMiddleware: Middleware = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export const middlewareExceptionWrapper = (middleware: Middleware): Middleware => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      middleware(req, res, next);
    } catch (err) {
      error('Encountered error in middleware, error=%s', err);
      res.status(500);
    }
  };
};

export async function supplementStudioUserModel(context: UserContext): Promise<UserContext> {
  const model = await UserModel.findOne({ where: { externalId: context.userId } });
  context.studioUserModel = model ?? undefined;
  return context;
}

/**
 * Runs validation on a token provided by a user and returns a [[ValidationResult]] object.
 *
 * @param token token representing authorization provided by the user. Currently only supports JWT
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
  try {
    let payload: DNATokenPayload = {};
    const { iss, sub } = JWT.decode(token as string) as Record<string, string | undefined>;
    if (!iss || typeof iss !== 'string' || !sub || typeof sub !== 'string') {
      return {
        valid: false,
      };
    }

    switch (iss) {
      case PublisherTokenIssuer:
        payload = JWT.verify(token as string, config.JWT_SECRET_KEY!) as DNATokenPayload;
        if (!payload || !payload.sub) {
          return {
            valid: false,
          };
        }
        return {
          valid: true,
          userID: payload.sub as string,
          payload,
        };
      default:
        // Try to fetch DNA AppID if the issuer matches
        if (/[a-z0-9]{32}/.test(iss)) {
          const result = await retry(
            async () => {
              const res = await DNA.sso.validateJWT(token, true, true);
              return res;
            },
            {
              minTimeout: 250,
              maxTimeout: 1000,
              randomize: true,
              retries: NUM_DNA_VERIFY_ATTEMPTS,
              onRetry: (reqErr: Error, attempt: number) => {
                warn(
                  'Failed to verify DNA JWT=[%s...] on attempt=%s with error=%s',
                  token.substr(0, 10),
                  attempt,
                  reqErr.message
                );
              },
            }
          );

          if (!result.valid) {
            return { valid: false };
          }
          return {
            payload: result.payload,
            userID: result.payload?.sub,
            valid: result.valid,
          };
        }
        warn('Unhandled token iss field: [%s]', iss);
        return {
          valid: false,
        };
    }
  } catch (jwtError) {
    if (config.isDev()) {
      info('JWT Error:', jwtError.message || jwtError.code || jwtError);
    }
    return {
      valid: false,
    };
  }
}
