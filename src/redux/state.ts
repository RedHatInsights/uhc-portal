// import { reduxReducers } from './reducers';
import { Reducer } from 'redux';

import type { ErrorState } from '../types/types';

import type { NormalizedAWSAccountRole } from './model/NormalizedAWSAccountRole';

export type PromiseReducerState<T = unknown> =
  | (Partial<T> & { pending: boolean; fulfilled: false; error: false })
  // Should error state have access to the Partial<T> or should it be only ErrorState?
  | (Partial<T> & ErrorState)
  | (T & { pending: boolean; fulfilled: true; error: false });

type BaseState = ReturnType<Reducer>;

export type GlobalState = Omit<BaseState, 'rosaReducer'> & {
  // Temporary overrides for reducers that aren't written in TypeScript
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
