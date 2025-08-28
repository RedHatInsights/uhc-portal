import promiseMiddleware from 'redux-promise-middleware';

import { configureStore, Middleware } from '@reduxjs/toolkit';

import { NormalizedAWSAccountRole } from './model/NormalizedAWSAccountRole';
import promiseRejectionMiddleware from './promiseRejectionMiddleware';
import { reduxReducers } from './reducers';
import sentryMiddleware from './sentryMiddleware';
import { PromiseReducerState } from './types';

// NOTE: in order to keep testing accurate
// if you change the store (see below)
// also make a change to src/testUtils.tsx
const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: { warnAfter: 256 }, // We can also set immutableCheck to false to prevent checking (and warnings).  Note it is false in prod builds
    })
      .concat(promiseRejectionMiddleware as Middleware)
      .concat(promiseMiddleware)
      .concat(sentryMiddleware as Middleware),
  reducer: reduxReducers,
});

export type GlobalState = Omit<ReturnType<typeof store.getState>, 'rosaReducer'> & {
  // TODO temporary overrides for reducers that aren't written in typescript
  rosaReducer: {
    getAWSBillingAccountsResponse: any;
    getAWSAccountRolesARNsResponse: PromiseReducerState<{
      data: NormalizedAWSAccountRole[];
    }>;
    getAWSAccountIDsResponse: {
      data: any[];
      pending: boolean;
    };
    offlineToken?: string;
  };
};

export { store };
export default store;
