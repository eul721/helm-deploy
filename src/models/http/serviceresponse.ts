import { HttpCode } from './httpcode';

/**
 * Outbound response payload to clients.
 */
export interface ServiceResponse<T = void> {
  code: HttpCode;
  payload?: T;
}
