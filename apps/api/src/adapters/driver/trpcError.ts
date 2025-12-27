import { AppError, ERROR_CODES } from '@api/domain/entities/errors';
import { TRPCError } from '@trpc/server';

export const onError = (error: unknown) => {
  console.log('### here error');
  if (error instanceof AppError) {
    switch (error.errorCode) {
      case ERROR_CODES.NOTE_NOT_FOUND:
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.errorCode,
          cause: error,
        });
      case ERROR_CODES.NOT_ENOUGH_PRIVILEGES:
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.errorCode,
          cause: error,
        });

      default:
        break;
    }
  }

  throw error;
};
