import { HttpCode } from '../models/http/httpcode';
import { ServiceResponse } from '../models/http/serviceresponse';

/* eslint max-classes-per-file: ["error", 10] */

export enum ErrorReason {
  MalformedPastValidation = 'Malformed request made it past validation',
}

export class ErrorServiceResponse extends Error {
  constructor(response: ServiceResponse<unknown>) {
    super(response.message);
    this.name = 'Exception';
    this.response = response;
  }

  response: ServiceResponse<unknown>;
}

export class BadRequestResponse extends ErrorServiceResponse {
  constructor(message: string) {
    super({ code: HttpCode.BAD_REQUEST, message });
    Object.setPrototypeOf(this, BadRequestResponse.prototype);
  }
}

export class NotFoundResponse extends ErrorServiceResponse {
  constructor(message: string) {
    super({ code: HttpCode.NOT_FOUND, message });
    Object.setPrototypeOf(this, NotFoundResponse.prototype);
  }
}

export class InternalServerErrorResponse extends ErrorServiceResponse {
  constructor(message: string) {
    super({ code: HttpCode.INTERNAL_SERVER_ERROR, message });
    Object.setPrototypeOf(this, InternalServerErrorResponse.prototype);
  }
}
