export const ERROR_CODES = {
  NOTE_NOT_FOUND: 'NOTE_NOT_FOUND',
  NOT_ENOUGH_PRIVILEGES: 'NOT_ENOUGH_PRIVILEGES',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  constructor(
    message: string,
    public readonly errorCode: ErrorCode,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
