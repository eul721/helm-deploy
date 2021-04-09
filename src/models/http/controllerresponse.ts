import { HttpCode } from './httpcode';

/**
 * Outbound response payload to clients.
 */
export interface ControllerResponse<T = void> {
  code: HttpCode;
  payload?: T;
}
