import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { ErrorState } from '~/types/types';

import { addNotificationErrorFormat, formatErrorData, formatOcmApiErrorMessage } from './helpers';

const createAxiosError = (
  status: number,
  data: Record<string, unknown>,
): AxiosError<{ code?: string; reason?: string; details?: unknown; operation_id?: string }> => {
  const error = new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, undefined, undefined, {
    status,
    statusText: 'Error',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data,
  });
  return error;
};

describe('formatOcmApiErrorMessage', () => {
  it('combines code and reason when both are provided', () => {
    expect(formatOcmApiErrorMessage('CLUSTERS-MGMT-400', 'Bad request', 400)).toBe(
      'CLUSTERS-MGMT-400: Bad request',
    );
  });

  it('uses a 429 fallback when reason is missing', () => {
    expect(formatOcmApiErrorMessage('CLUSTERS-MGMT-429', undefined, 429)).toBe(
      'CLUSTERS-MGMT-429: Too many requests. Please try again.',
    );
  });

  it('uses a generic fallback when code is present without reason or known status', () => {
    expect(formatOcmApiErrorMessage('CLUSTERS-MGMT-500', undefined, 500)).toBe(
      'CLUSTERS-MGMT-500: An error occurred. Please try again.',
    );
  });

  it('returns reason alone when code is absent', () => {
    expect(formatOcmApiErrorMessage(undefined, 'Something went wrong', 400)).toBe(
      'Something went wrong',
    );
  });

  it('returns HTTP status fallback when code and reason are absent', () => {
    expect(formatOcmApiErrorMessage(undefined, undefined, 429)).toBe(
      'Too many requests. Please try again.',
    );
  });

  it('never surfaces the literal string undefined', () => {
    expect(formatOcmApiErrorMessage('CLUSTERS-MGMT-429', undefined, 429)).not.toContain(
      'undefined',
    );
  });
});

describe('formatErrorData', () => {
  it('formats axios 429 errors without a reason field', () => {
    const axiosError = createAxiosError(429, { code: 'CLUSTERS-MGMT-429' });

    const result = formatErrorData(false, true, axiosError);
    const error = result.error as ErrorState;

    expect(error.errorMessage).toBe('CLUSTERS-MGMT-429: Too many requests. Please try again.');
    expect(error.internalErrorCode).toBe('CLUSTERS-MGMT-429');
    expect(error.errorCode).toBe(429);
    expect(error.errorMessage).not.toContain('undefined');
  });

  it('preserves code and reason when reason is provided', () => {
    const axiosError = createAxiosError(400, {
      code: 'CLUSTERS-MGMT-400',
      reason: 'Invalid channel',
    });

    const result = formatErrorData(false, true, axiosError);

    expect(result.error?.errorMessage).toBe('CLUSTERS-MGMT-400: Invalid channel');
    expect(result.error?.reason).toBe('Invalid channel');
  });
});

describe('addNotificationErrorFormat', () => {
  it('uses reason when present', () => {
    const axiosError = createAxiosError(400, {
      code: 'CLUSTERS-MGMT-400',
      reason: 'Invalid channel',
    });

    const result = addNotificationErrorFormat(false, true, axiosError);

    expect(result?.error?.errorMessage).toBe('Invalid channel');
  });

  it('falls back when reason is missing on a 429 response', () => {
    const axiosError = createAxiosError(429, { code: 'CLUSTERS-MGMT-429' });

    const result = addNotificationErrorFormat(false, true, axiosError);

    expect(result?.error?.errorMessage).toBe(
      'CLUSTERS-MGMT-429: Too many requests. Please try again.',
    );
    expect(result?.error?.errorMessage).not.toContain('undefined');
  });
});
