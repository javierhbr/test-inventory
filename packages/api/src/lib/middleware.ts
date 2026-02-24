import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from 'aws-lambda';

export type ApiHandler = Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
>;

export function createHandler(handler: ApiHandler) {
  return middy(handler)
    .use(jsonBodyParser())
    .use(httpErrorHandler())
    .use(cors());
}
