import { HttpResponse } from 'msw';

export const createTrpcBatchJson = (json: object) =>
  HttpResponse.json([{ result: { data: { json } } }]);
