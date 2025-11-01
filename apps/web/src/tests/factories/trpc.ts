import { HttpResponse } from 'msw';

export const createTrpcBatchJson = (json: object) =>
  HttpResponse.json([{ result: { data: { json } } }]);

export type TrpcBatchInput<T> = [{ json: T }];

export const extractTrpcInput = <T>(body: TrpcBatchInput<T>) => body[0].json;
