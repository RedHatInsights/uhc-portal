import { produce } from 'immer';

import { Organization, QuotaCostList, TermsReviewResponse } from '~/types/accounts_mgmt.v1';
import { UserInfo } from '~/types/types';

import { getErrorState } from '../../common/errors';
import { UserAction } from '../actions/userActions';
import { userConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import { PromiseActionType } from '../types';

export type OrganizationState = {
  details: Organization;
  quotaList: QuotaCostList | undefined;
  timestamp: number;
};

export type UserProfileState = {
  keycloakProfile: Partial<UserInfo>;
  organization: PromiseReducerState<OrganizationState>;
  selfTermsReviewResult: PromiseReducerState<TermsReviewResponse>;
};

const initialState: UserProfileState = {
  keycloakProfile: {},
  organization: {
    ...baseRequestState,
    quotaList: {
      items: [],
    } as any as QuotaCostList,
    timestamp: 0,
  },
  selfTermsReviewResult: {
    ...baseRequestState,
    terms_available: false,
    terms_required: false,
    redirect_url: '',
  },
};
const userProfile = (
  state = initialState,
  action: PromiseActionType<UserAction>,
): UserProfileState =>
  produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case userConstants.USER_INFO_RESPONSE:
        draft.keycloakProfile = action.payload;
        break;

      // GET_ORGANIZATION
      case REJECTED_ACTION(userConstants.GET_ORGANIZATION):
        draft.organization = {
          ...initialState.organization,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(userConstants.GET_ORGANIZATION):
        draft.organization.pending = true;
        break;
      case FULFILLED_ACTION(userConstants.GET_ORGANIZATION):
        draft.organization = {
          ...baseRequestState,
          fulfilled: true,
          details: action.payload.organization,
          quotaList: action.payload.quota as QuotaCostList | undefined,
          timestamp: new Date().getTime(),
        };
        break;
      // SELF_TERMS_REVIEW
      case REJECTED_ACTION(userConstants.SELF_TERMS_REVIEW):
        draft.selfTermsReviewResult = {
          ...initialState.selfTermsReviewResult,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(userConstants.SELF_TERMS_REVIEW):
        draft.selfTermsReviewResult.pending = true;
        break;
      case FULFILLED_ACTION(userConstants.SELF_TERMS_REVIEW):
        draft.selfTermsReviewResult = {
          ...baseRequestState,
          fulfilled: true,
          ...action.payload.data,
          redirect_url: action.payload.data.redirect_url ?? '',
        };
        break;
    }
  });

export default userProfile;
