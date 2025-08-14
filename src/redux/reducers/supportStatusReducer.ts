import { produce } from 'immer';
import { get } from 'lodash';

import { ProductLifeCycle } from '~/types/product-life-cycles';

import { SupportStatusAction } from '../actions/supportStatusActions';
import GET_SUPPORT_STATUS from '../constants/supportStatusConstants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import type { PromiseActionType } from '../types';

type SupportStatusState = PromiseReducerState & {
  supportStatus: { [index: string]: string };
};

const initialState: SupportStatusState = {
  ...baseRequestState,
  supportStatus: {},
};

const supportStatusReducer = (
  // eslint-disable-next-line default-param-last
  state: SupportStatusState = initialState,
  action: PromiseActionType<SupportStatusAction>,
) =>
  // eslint-disable-next-line consistent-return
  produce(state, (draft) => {
    switch (action.type) {
      case REJECTED_ACTION(GET_SUPPORT_STATUS):
        // can't use getErrorState here - this is not using an OCM api.
        draft.pending = false;
        draft.fulfilled = false;
        draft.error = true;
        break;

      case PENDING_ACTION(GET_SUPPORT_STATUS):
        draft.pending = true;
        draft.fulfilled = false;
        draft.error = false;
        break;

      case FULFILLED_ACTION(GET_SUPPORT_STATUS):
        draft.pending = false;
        draft.fulfilled = true;
        draft.error = false;
        draft.supportStatus = (get(action.payload, 'data.data[0].versions', []) as []).reduce(
          (
            result: { [id: string]: string },
            versionInfo: ProductLifeCycle['versions'][number],
          ) => ({ ...result, [versionInfo.name]: versionInfo.type }),
          {},
        );
        break;
      default:
        return state;
    }
  });

export { SupportStatusState, initialState };
export default supportStatusReducer;
