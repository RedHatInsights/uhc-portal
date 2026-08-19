import React from 'react';
import { AxiosInstance, AxiosResponse } from 'axios';
import { useLocation } from 'react-router-dom';

import { getInternalErrorCode, hasOwnErrorPage, TERMS_REQUIRED_CODE } from '../../../common/errors';
import TermsError from '../../common/TermsGuard/TermsError';

import apiErrorInterceptor from './ApiErrorInterceptor';

type Props = {
  children: React.ReactElement;
  apiRequest: AxiosInstance;
  apiError?: AxiosResponse | null;
  showApiError: (error: AxiosResponse) => void;
  clearApiError: () => void;
};

const ApiError = ({ apiRequest, showApiError, children, apiError, clearApiError }: Props) => {
  const location = useLocation();
  // eslint-disable-next-line no-console
  console.log('ApiError rendered');

  React.useEffect(() => {
    const ejectApiErrorInterceptor = apiErrorInterceptor(apiRequest, showApiError);
    // when user navigates away, clear any apiError state.
    const detachHistoryListener = () => clearApiError();
    return () => {
      ejectApiErrorInterceptor();
      detachHistoryListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRequest, clearApiError, location]);

  // watch only errors that have their own error pages
  if (apiError && hasOwnErrorPage(apiError)) {
    const internalErrorCode = getInternalErrorCode(apiError);
    if (internalErrorCode === TERMS_REQUIRED_CODE) {
      return <TermsError error={apiError} restore={clearApiError} />;
    }
    // eslint-disable-next-line no-console
    console.error(`no defined error page: code=${internalErrorCode}`);
  }

  return children;
};

export default ApiError;
