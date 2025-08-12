import { getErrorState } from '../../common/errors';
import type { Flavour } from '../../types/clusters_mgmt.v1';
import { DEFAULT_FLAVOUR_ID, FlavourAction } from '../actions/flavourActions';
import { GET_DEFAULT_FLAVOUR } from '../constants/flavourConstants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import type { PromiseActionType } from '../types';

type State = PromiseReducerState<{
  byID: { [id: string]: Flavour };
}>;

export const initialState: State = {
  ...baseRequestState,
  // Presently we fetch only one flavour, 'osd-4' (DEFAULT_FLAVOUR_ID), but data organized by id
  // so in future we can switch to fetching all if more than 1 needed.
  byID: {},
};

export default function flavoursReducer(
  state = initialState,
  action: PromiseActionType<FlavourAction>,
): State {
  switch (action.type) {
    case PENDING_ACTION(GET_DEFAULT_FLAVOUR):
      return {
        ...state,
        pending: true,
      };

    case REJECTED_ACTION(GET_DEFAULT_FLAVOUR):
      return {
        ...initialState,
        ...getErrorState(action),
      };

    case FULFILLED_ACTION(GET_DEFAULT_FLAVOUR):
      return {
        ...baseRequestState,
        fulfilled: true,
        byID: {
          [DEFAULT_FLAVOUR_ID]: action.payload.data,
        },
      };

    default:
      return state;
  }
}
