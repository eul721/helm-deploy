import { DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';

/**
 * Results from an attempt to validate a JWT
 */
export interface TokenValidationResult {
  /** Optional payload of token if it is successfully validated */
  payload?: DNATokenPayload;
  /** UserID of the provided validation (if applicable) */
  userID?: string;
  /** True IFF the token is valid */
  valid: boolean;
}
