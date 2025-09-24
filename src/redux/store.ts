import promiseMiddleware from 'redux-promise-middleware';

import { configureStore, Middleware } from '@reduxjs/toolkit';

import promiseRejectionMiddleware from './promiseRejectionMiddleware';
import { reduxReducers } from './reducers';
import sentryMiddleware from './sentryMiddleware';

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

export { store };
export default store;
