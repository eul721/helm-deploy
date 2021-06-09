import { ServiceResponse } from '../models/http/serviceresponse';

export interface DebuggerResponse {
  // HTTP Response code
  code: number;
  // String message
  message: string | string[];
}

export function toDebuggerResponse(response: ServiceResponse<unknown>): DebuggerResponse {
  const message = response.payload ? [JSON.stringify(response.payload)] : [response.message ?? ''];
  return {
    code: response.code,
    message: message ?? (response.code === 200 || response.code === 201) ? 'Success' : 'Failed',
  };
}
