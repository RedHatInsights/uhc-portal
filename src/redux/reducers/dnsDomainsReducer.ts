/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import sortBy from 'lodash/sortBy';

import { getErrorState } from '~/common/errors';
import { DnsDomainsAction } from '~/redux/actions/dnsDomainsActions';
import { DnsDomain } from '~/types/clusters_mgmt.v1';

import { dnsDomainsConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import { PromiseActionType } from '../types';

export type State = PromiseReducerState<{
  items: DnsDomain[];
  createdDnsId: string;
  deletedDnsId?: string;
  isUpdatingDomains: boolean;
}>;

const initialState: State = {
  ...baseRequestState,
  items: [],
  createdDnsId: '',
  deletedDnsId: '',
  isUpdatingDomains: false,
};

function dnsDomainsReducer(
  state = initialState,
  action: PromiseActionType<DnsDomainsAction>,
): State {
  switch (action.type) {
    case REJECTED_ACTION(dnsDomainsConstants.GET_DNS_DOMAINS):
      return {
        ...initialState,
        ...state,
        ...getErrorState(action),
      };

    case PENDING_ACTION(dnsDomainsConstants.GET_DNS_DOMAINS):
      return {
        ...initialState,
        ...state,
        isUpdatingDomains: false,
        pending: true,
      };

    case FULFILLED_ACTION(dnsDomainsConstants.GET_DNS_DOMAINS):
      return {
        ...baseRequestState,
        items: sortBy(action.payload.data.items || [], ['id']),
        isUpdatingDomains: false,
        fulfilled: true,
      } as State;

    case REJECTED_ACTION(dnsDomainsConstants.CREATE_DNS_DOMAIN):
      return {
        ...initialState,
        ...state,
        ...getErrorState(action),
        isUpdatingDomains: false,
      };

    case PENDING_ACTION(dnsDomainsConstants.CREATE_DNS_DOMAIN):
      return {
        ...initialState,
        ...state,
        pending: true,
        isUpdatingDomains: true,
      };

    case FULFILLED_ACTION(dnsDomainsConstants.CREATE_DNS_DOMAIN): {
      const newDomainItem = action.payload.data as Required<DnsDomain>;

      const combinedItems = (state.items || []).concat([newDomainItem]);
      return {
        ...state,
        items: sortBy(combinedItems, ['id']),
        error: false,
        pending: false,
        fulfilled: true,
        isUpdatingDomains: false,
        createdDnsId: newDomainItem.id,
      };
    }

    case PENDING_ACTION(dnsDomainsConstants.DELETE_DNS_DOMAIN):
      return {
        ...initialState,
        ...state,
        deletedDnsId: action.meta.deletedDnsId,
        pending: true,
        isUpdatingDomains: true,
      };

    case FULFILLED_ACTION(dnsDomainsConstants.DELETE_DNS_DOMAIN): {
      return {
        ...state,
        items: (state.items || []).filter((item) => item.id !== action.meta.deletedDnsId),
        error: false,
        pending: false,
        fulfilled: true,
        isUpdatingDomains: false,
        createdDnsId: '',
      };
    }

    case REJECTED_ACTION(dnsDomainsConstants.DELETE_DNS_DOMAIN):
      return {
        ...initialState,
        ...state,
        ...getErrorState(action),
        isUpdatingDomains: false,
      };

    case dnsDomainsConstants.CLEAR_CREATED_DNS_DOMAIN:
      return {
        ...state,
        ...baseRequestState,
        createdDnsId: '',
        isUpdatingDomains: false,
      };

    default:
      return state;
  }
}

dnsDomainsReducer.initialState = initialState;

export { initialState };

export default dnsDomainsReducer;
