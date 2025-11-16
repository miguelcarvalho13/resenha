import { HttpResponse } from 'msw';

export const createTrpcJson = (json: object) =>
  HttpResponse.json({ result: { data: { json } } });

export const createTrpcBatchJson = (json: object) =>
  HttpResponse.json([{ result: { data: { json } } }]);

export type TrpcInput<T> = { json: T };

export const extractTrpcInput = <T>(body: TrpcInput<T>) => body.json;

export const extractTrpcInputQuery = <T>(url: string): T => {
  const inputEncoded = new URL(url).searchParams.get('input');

  if (!inputEncoded) {
    throw new Error('No trpc input found on request url');
  }

  const input = JSON.parse(decodeURIComponent(inputEncoded)) as TrpcInput<T>;

  return input.json;
};

export type TrpcBatchInput<T> = [{ json: T }];

export const extractTrpcBatchInput = <T>(body: TrpcBatchInput<T>) =>
  body[0].json;
