import { Request, Response } from 'express';
import { error } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { ServiceResponse } from '../models/http/serviceresponse';
import { sendMessageResponse, sendServiceResponse } from './http';

export const endpointServiceCallWrapper = (
  handler: (req: Request, res: Response) => Promise<ServiceResponse<unknown>>
) => async (req: Request, res: Response) => {
  try {
    const response = await handler(req, res);
    sendServiceResponse(response, res);
  } catch (err) {
    error(`Encountered error in endpoint, error: ${err}`);
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Exception while processing the request');
  }
};
