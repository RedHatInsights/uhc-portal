import type { AxiosError } from 'axios';
import type { AnyAction } from 'redux';
import type { ActionType as PActionType } from 'redux-promise-middleware';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import type { Action, TypeConstant } from 'typesafe-actions';

import type { GlobalState } from './stateTypes';

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, GlobalState, unknown, AnyAction>;

export type AppThunkDispatch = ThunkDispatch<GlobalState, unknown, AnyAction>;

export type BaseRequestState = {
  fulfilled: false;
  error: false;
  pending: false;
};

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

/**
 * Converts a PromiseReducerState (which uses literal types like fulfilled: true | false)
 * into a component-friendly prop type (which uses boolean types).
 *
 * This is needed because:
 * - PromiseReducerState is a discriminated union optimized for reducers with literal types
 * - Component props and test fixtures need boolean types for flexibility
 *
 * The data field will be:
 * - undefined/partial during pending/error states
 * - fully populated when fulfilled
 *
 * @example
 * type CloudProvidersState = ComponentPromiseState<CloudProvidersReduxState>;
 */
export type ComponentPromiseState<TReduxState extends Record<string, any>> = {
  fulfilled: boolean;
  pending: boolean;
  error: boolean;
  errorMessage?: string;
  reason?: string;
  errorCode?: number;
} & {
  [K in Exclude<keyof TReduxState, 'fulfilled' | 'pending' | 'error'>]?: NonNullable<
    TReduxState[K]
  >;
};
