import { Request, Response } from 'express';
import { QueryParam, HeaderParam, headerParamLookup } from '../configuration/httpconfig';
import { debug } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { ServiceResponse } from '../models/http/serviceresponse';

export function getHeaderParamValue(req: Request, key: HeaderParam) {
  const headerKey = headerParamLookup[key];
  return req.header(headerKey);
}

export function getQueryParamValue(req: Request, key: QueryParam) {
  return (req.query[key] ?? req.query[key.toLowerCase()] ?? req.query[key.toUpperCase()])?.toString();
}

export function sendMessageResponse(res: Response, code: HttpCode = HttpCode.OK, message?: string) {
  debug(`sendMessageResponse code ${code}, message ${message}`);
  res.status(code).json(message ? { message } : {});
}

export function sendServiceResponse(serviceResponse: ServiceResponse<unknown>, res: Response) {
  debug(
    `sendServiceResponse code ${serviceResponse.code}, message ${serviceResponse.message}, payload ${serviceResponse.payload}`
  );
  res.status(serviceResponse.code).json(serviceResponse.payload ?? { message: serviceResponse.message ?? '' });
}
