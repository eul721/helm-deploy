import { DNA, DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import retry from 'async-retry';
import * as JWT from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { TokenValidationResult } from '../models/auth/tokenvalidationresult';
import { envConfig } from '../configuration/envconfig';
import { error, info, warn } from '../logger';
import { PublisherTokenIssuer } from '../services/devtokengenerator';
import { QueryParam, HeaderParam, headerParamLookup } from '../configuration/httpconfig';

const NUM_DNA_VERIFY_ATTEMPTS = 3;

/**
 * Type defining middleware
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function useDummyAuth(): boolean {
  return envConfig.isDev() && envConfig.ALLOW_UNAUTHORIZED === 'true';
}

export const dummyMiddleware: Middleware = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export const getHeaderParamValue = (req: Request, key: HeaderParam) => {
  const headerKey = headerParamLookup[key];
  return req.header(headerKey);
};

export const getQueryParamValue = (req: Request, key: QueryParam) => {
  return (req.query[key] ?? req.query[key.toLowerCase()] ?? req.query[key.toUpperCase()])?.toString();
};

export const middlewareExceptionWrapper = (middleware: Middleware): Middleware => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      middleware(req, res, next);
    } catch (err) {
      error('Encountered error in middleware, error=%s', err);
      res.status(500).json();
    }
  };
};

/**
 * Runs validation on a token provided by a user and returns a [[ValidationResult]] object.
 *
 * @param token token representing authorization provided by the user. Currently only supports JWT
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
  if (!envConfig.JWT_SECRET_KEY) {
    error('Env not configured correctly, missing JWT_SECRET_KEY');
    return {
      valid: false,
    };
  }

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
        payload = JWT.verify(token as string, envConfig.JWT_SECRET_KEY) as DNATokenPayload;
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
    if (envConfig.isDev()) {
      info('JWT Error:', jwtError.message || jwtError.code || jwtError);
    }
    return {
      valid: false,
    };
  }
}
