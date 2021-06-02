import { DNA, DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import retry from 'async-retry';
import * as JWT from 'jsonwebtoken';
import { TokenValidationResult } from '../models/auth/tokenvalidationresult';
import { envConfig } from '../configuration/envconfig';
import { error, info, warn } from '../logger';
import { PublisherTokenIssuer } from '../services/devtools';

const NUM_DNA_VERIFY_ATTEMPTS = 3;

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
          userId: payload.sub as string,
          accountType: 'dev-login',
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
            userId: result.payload?.sub,
            accountType: '2K-dna',
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
