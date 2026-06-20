import { ServiceUnavailableException } from '@nestjs/common';

export const STYLIST_OFFLINE_MESSAGE = 'AI Stylist is currently offline';

export function isStylistConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === 'AbortError') {
    return true;
  }

  const withCode = error as Error & { code?: string; cause?: unknown };
  if (withCode.code === 'ECONNREFUSED' || withCode.code === 'ENOTFOUND') {
    return true;
  }

  const cause = withCode.cause;
  if (cause instanceof Error) {
    return isStylistConnectionError(cause);
  }

  if (cause && typeof cause === 'object' && 'code' in cause) {
    const code = String((cause as { code?: string }).code);
    return code === 'ECONNREFUSED' || code === 'ENOTFOUND';
  }

  return false;
}

export function toStylistUnavailableException(error: unknown): ServiceUnavailableException {
  if (error instanceof ServiceUnavailableException) {
    return error;
  }

  return new ServiceUnavailableException(STYLIST_OFFLINE_MESSAGE);
}
