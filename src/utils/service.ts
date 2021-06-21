import { Request, Response } from 'express';
import { error } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { BaseResponse } from '../models/http/serviceresponse';
import { ErrorServiceResponse } from './errors';
import { sendMessageResponse, sendServiceResponse } from './http';

export function endpointServiceCallWrapper<T extends BaseResponse>(
  handler: (req: Request, res: Response) => Promise<T>
) {
  return async (req: Request, res: Response) => {
    try {
      const response = await handler(req, res);
      sendServiceResponse(response, res);
    } catch (err) {
      if (err instanceof ErrorServiceResponse) {
        const exception = err as ErrorServiceResponse;
        sendServiceResponse(exception.response, res);
      } else {
        error(`Encountered error in endpoint, error: ${err}`);
        sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Exception while processing the request');
      }
    }
  };
}

/** Return a valid (non-nan) number or undefined */
export function toIntOptional(input: string): number | undefined {
  const value = Number.parseInt(input, 10);
  return Number.isNaN(value) ? undefined : value;
}

/** Return a valid (non-nan) number or throws */
export function toIntRequired(input: string): number {
  const value = Number.parseInt(input, 10);
  if (Number.isNaN(value)) {
    throw new ErrorServiceResponse({
      code: HttpCode.BAD_REQUEST,
      message: 'Required numerical parameter is not a number',
    });
  }
  return value;
}
