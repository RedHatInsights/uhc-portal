import { getErrorState } from '../../common/errors';
import type { CloudProvider, CloudRegion } from '../../types/clusters_mgmt.v1';
import { CloudProviderAction } from '../actions/cloudProviderActions';
import { cloudProviderConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import type { PromiseActionType } from '../types';

export type State = PromiseReducerState<{
  providers: {
    // `regions` is overridden to be a map by id
    [providerId: string]: Omit<CloudProvider, 'regions'> & {
      regions: {
        [id: string]: CloudRegion;
      };
    };
  };
}>;

const initialState: State = {
  ...baseRequestState,
  providers: {},
};

const cloudProvidersReducer = (
  state: State = initialState,
  action: PromiseActionType<CloudProviderAction>,
): State => {
  switch (action.type) {
    case REJECTED_ACTION(cloudProviderConstants.GET_CLOUD_PROVIDERS):
      return {
        ...initialState,
        ...getErrorState(action),
      };
    case PENDING_ACTION(cloudProviderConstants.GET_CLOUD_PROVIDERS):
      return {
        ...state,
        pending: true,
      };
    case FULFILLED_ACTION(cloudProviderConstants.GET_CLOUD_PROVIDERS):
      return {
        ...initialState,
        providers: action.payload,
        fulfilled: true,
      };
    default:
      return state;
  }
};

cloudProvidersReducer.initialState = initialState;

export { initialState, cloudProvidersReducer };

export default cloudProvidersReducer;
