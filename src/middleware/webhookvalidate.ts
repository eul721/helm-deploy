import { NextFunction, Request, Response } from 'express';
import { HttpCode } from '../models/http/httpcode';
import { WebhookPayload } from '../models/http/webhook/webhookpayload';
import { sendMessageResponse } from '../utils/http';

/**
 * @apiDefine WebhookValidateMiddleware
 * @apiVersion 0.0.1
 */
export async function webhookValidate(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST') {
    try {
      const payload: WebhookPayload = req.body as WebhookPayload;
      res.locals.payload = payload;
    } catch (jsonException) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Bad Request');
      return;
    }
  }
  next();
}
