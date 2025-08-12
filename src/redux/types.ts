import type { AxiosError } from 'axios';
import type { AnyAction } from 'redux';
import type { ActionType as PActionType } from 'redux-promise-middleware';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import type { Action, TypeConstant } from 'typesafe-actions';

import type { ErrorState } from '../types/types';

import type { GlobalState } from './state';

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, GlobalState, unknown, AnyAction>;

export type AppThunkDispatch = ThunkDispatch<GlobalState, unknown, AnyAction>;

export type BaseRequestState = {
  fulfilled: false;
  error: false;
  pending: false;
};

export type PromiseReducerState<T = unknown> =
  | (Partial<T> & { pending: boolean; fulfilled: false; error: false })
  // Should error state have access to the Partial<T> or should it be only ErrorState?
  | (Partial<T> & ErrorState)
  | (T & { pending: boolean; fulfilled: true; error: false });

interface AsyncAction extends Action {
  payload?: Promise<any>;
}

export type Merge<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type PromiseAction<TAction extends AsyncAction, TActionType extends PActionType> = Merge<
  Omit<TAction, 'type' | 'payload'> & {
    type: `${TAction['type']}_${TActionType}`;
    payload: TActionType extends PActionType.Rejected
      ? AxiosError<Awaited<TAction['payload']>['data']>
      : Awaited<TAction['payload']>;
  }
>;

export type PromiseActionType<T> = T extends {
  type: TypeConstant;
  payload: Promise<any>;
}
  ?
      | PromiseAction<T, PActionType.Fulfilled>
      | PromiseAction<T, PActionType.Pending>
      | PromiseAction<T, PActionType.Rejected>
  : T;
