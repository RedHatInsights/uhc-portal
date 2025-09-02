import { action, ActionType } from 'typesafe-actions';

import accessRequestService from '~/services/accessTransparency/accessRequestService';
import { ViewOptions } from '~/types/types';

import { accessRequestConstants } from '../constants';

const getAccessRequests = (subscriptionId: string, params: ViewOptions) =>
  action(
    accessRequestConstants.GET_ACCESS_REQUESTS,
    accessRequestService.getAccessRequests({
      page: params.currentPage,
      size: params.pageSize,
      search: `subscription_id='${subscriptionId}'`,
      orderBy: params.sorting.sortField
        ? `${params.sorting.sortField} ${params.sorting.isAscending ? 'asc' : 'desc'}`
        : undefined,
    }),
  );

const accessRequestActions = {
  getAccessRequests,
} as const;

type AccessRequestAction = ActionType<
  (typeof accessRequestActions)[keyof typeof accessRequestActions]
>;

export { AccessRequestAction, accessRequestActions, getAccessRequests };
