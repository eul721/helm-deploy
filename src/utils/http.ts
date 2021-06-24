import { Request, Response } from 'express';
import { QueryParam, HeaderParam, headerParamLookup } from '../configuration/httpconfig';
import { debug, error, warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { BaseResponse } from '../models/http/serviceresponse';

export function getHeaderParamValue(req: Request, key: HeaderParam) {
  const headerKey = headerParamLookup[key];
  return req.header(headerKey);
}

export function getQueryParamValue(req: Request, key: QueryParam) {
  return (req.query[key] ?? req.query[key.toLowerCase()] ?? req.query[key.toUpperCase()])?.toString();
}

function logMessage(code: HttpCode, sender: string, message?: unknown) {
  if (code === HttpCode.OK || code === HttpCode.CREATED) {
    debug(`${sender} code: ${code}, content: ${message}`);
  } else if (code === HttpCode.INTERNAL_SERVER_ERROR) {
    error(`${sender} code: ${code}, content: ${message}`);
  } else {
    warn(`${sender} code: ${code}, content: ${message}`);
  }
}

export function sendMessageResponse(res: Response, code: HttpCode = HttpCode.OK, message?: string) {
  logMessage(code, 'sendMessageResponse', message);
  res.status(code).json(message ? { message } : {});
}

export function sendServiceResponse(serviceResponse: BaseResponse, res: Response) {
  logMessage(
    serviceResponse.code,
    'sendServiceResponse',
    serviceResponse.payload ? JSON.stringify(serviceResponse.payload) : serviceResponse.message
  );
  res.status(serviceResponse.code).json(serviceResponse.payload ?? { message: serviceResponse.message ?? '' });
}
