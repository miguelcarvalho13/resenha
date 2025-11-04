import { HttpResponse } from 'msw';

export const createTrpcJson = (json: object) =>
  HttpResponse.json({ result: { data: { json } } });

export const createTrpcBatchJson = (json: object) =>
  HttpResponse.json([{ result: { data: { json } } }]);

export type TrpcInput<T> = { json: T };

export const extractTrpcInput = <T>(body: TrpcInput<T>) => body.json;

export type TrpcBatchInput<T> = [{ json: T }];

export const extractTrpcBatchInput = <T>(body: TrpcBatchInput<T>) =>
  body[0].json;
