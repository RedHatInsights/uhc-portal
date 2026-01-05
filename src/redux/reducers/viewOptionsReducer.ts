import {
  ONLY_MY_CLUSTERS_TOGGLE_CLUSTER_ARCHIVES_LIST,
  ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST,
} from '~/common/localStorageConstants';
import { ViewOptions } from '~/types/types';

import { AccessRequestAction } from '../actions/accessRequestActions';
import type { ClusterAction } from '../actions/clustersActions';
import type { DashboardsAction } from '../actions/dashboardsActions';
import type { SubscriptionsAction } from '../actions/subscriptionsActions';
import type { ViewOptionsAction } from '../actions/viewOptionsActions';
import {
  dashboardsConstants,
  subscriptionsConstants,
  viewConstants,
  viewOptionsConstants,
  viewPaginationConstants,
} from '../constants';
import { GET_ACCESS_REQUESTS } from '../constants/accessRequestConstants';
import { FULFILLED_ACTION, REJECTED_ACTION } from '../reduxHelpers';
import type { PromiseActionType } from '../types';

type ViewState = ViewOptions;

type State = { [viewType: string]: ViewState };

const INITIAL_VIEW_STATE: ViewState = {
  currentPage: 1,
  pageSize: 50,
  totalCount: 0,
  totalPages: 0,
  filter: '',
  sorting: {
    sortField: 'created_at',
    isAscending: false,
    sortIndex: 3,
  },
  flags: {
    showArchived: false,
  },
};
const INITIAL_ACCESS_REQUESTS_VIEW_STATE: ViewState = {
  ...INITIAL_VIEW_STATE,
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  sorting: {
    sortIndex: 0,
    sortField: 'created_at',
    isAscending: false,
  },
};

const INITIAL_ARCHIVED_VIEW_STATE: ViewState = {
  ...INITIAL_VIEW_STATE,
  sorting: {
    sortField: 'display_name',
    isAscending: true,
    sortIndex: 0,
  },
  flags: {
    ...INITIAL_VIEW_STATE.flags,
    showMyClustersOnly:
      localStorage.getItem(ONLY_MY_CLUSTERS_TOGGLE_CLUSTER_ARCHIVES_LIST) === 'true',
  },
};

const INITIAL_CLUSTER_LIST_VIEW_STATE: ViewState = {
  ...INITIAL_VIEW_STATE,
  flags: {
    ...INITIAL_VIEW_STATE.flags,
    showMyClustersOnly: localStorage.getItem(ONLY_MY_CLUSTERS_TOGGLE_CLUSTERS_LIST) === 'true',
  },
};

const INITIAL_OSL_VIEW_STATE: ViewState = {
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  filter: {
    description: '',
    loggedBy: '',
  },
  sorting: {
    sortIndex: 0,
    sortField: 'timestamp',
    isAscending: false,
  },
  flags: {
    conditionalFilterFlags: {
      severityTypes: [],
      logTypes: [],
    },
  },
};

const INITIAL_OVERVIEW_VIEW_STATE: ViewState = {
  ...INITIAL_VIEW_STATE,
  currentPage: 1,
  pageSize: 5,
  totalCount: 0,
  totalPages: 0,
};

const initialState: State = {};

initialState[viewConstants.ACCESS_REQUESTS_VIEW] = Object.assign(
  INITIAL_ACCESS_REQUESTS_VIEW_STATE,
);
initialState[viewConstants.CLUSTERS_VIEW] = Object.assign(INITIAL_CLUSTER_LIST_VIEW_STATE);
initialState[viewConstants.ARCHIVED_CLUSTERS_VIEW] = Object.assign(INITIAL_ARCHIVED_VIEW_STATE);
initialState[viewConstants.CLUSTER_LOGS_VIEW] = Object.assign(INITIAL_OSL_VIEW_STATE);
initialState[viewConstants.OVERVIEW_VIEW] = Object.assign(INITIAL_OVERVIEW_VIEW_STATE);
initialState[viewConstants.OVERVIEW_EXPIRED_TRIALS] = Object.assign(INITIAL_OVERVIEW_VIEW_STATE);
initialState[viewConstants.CLUSTER_TRANSFER_VIEW] = Object.assign(
  INITIAL_ACCESS_REQUESTS_VIEW_STATE,
);

const viewOptionsReducer = (
  state = initialState,
  action: PromiseActionType<
    | AccessRequestAction
    | ViewOptionsAction
    | DashboardsAction
    | ClusterAction
    | SubscriptionsAction

    // TODO create typescript action
    | {
        type: 'VIEW_MY_CLUSTERS_ONLY_CHANGED';
        // TODO refactor viewType to be part of the payload
        viewType: string;
        payload: {
          showMyClustersOnly: boolean;
        };
      }
  >,
): State => {
  const updateState: State = {};

  const updatePageCounts = (viewType: string, itemsCount: number, perPageSize?: number) => {
    const totalCount = itemsCount || 1;

    const pageSize = perPageSize || state[viewType].pageSize;

    const totalPages = Math.ceil(totalCount / pageSize);

    updateState[viewType] = {
      ...state[viewType],
      totalCount,
      totalPages,
      pageSize,
      currentPage: Math.min(state[viewType].currentPage, totalPages),
    };
  };

  switch (action.type) {
    case viewOptionsConstants.VIEW_MY_CLUSTERS_ONLY_CHANGED:
      updateState[action.viewType] = {
        ...state[action.viewType],
        flags: {
          ...state[action.viewType].flags,
          showMyClustersOnly: action.payload.showMyClustersOnly,
        },
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_FIRST_PAGE:
      updateState[action.payload.viewType] = { ...state[action.payload.viewType], currentPage: 1 };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_LAST_PAGE:
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        currentPage: state[action.payload.viewType].totalPages,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_PREVIOUS_PAGE:
      if (state[action.payload.viewType].currentPage < 2) {
        return state;
      }

      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        currentPage: state[action.payload.viewType].currentPage - 1,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_NEXT_PAGE:
      if (state[action.payload.viewType].currentPage >= state[action.payload.viewType].totalPages) {
        return state;
      }
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        currentPage: state[action.payload.viewType].currentPage + 1,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_PAGE_NUMBER:
      if (
        !Number.isInteger(action.payload.pageNumber) ||
        action.payload.pageNumber < 1 ||
        action.payload.pageNumber > state[action.payload.viewType].totalPages
      ) {
        return state;
      }

      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        currentPage: action.payload.pageNumber,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.SET_PER_PAGE:
      if (action.payload.updatePageCounts) {
        updatePageCounts(
          action.payload.viewType,
          state[action.payload.viewType].totalCount,
          action.payload.pageSize,
        );
      } else {
        updateState[action.payload.viewType] = {
          ...state[action.payload.viewType],
          pageSize: action.payload.pageSize,
          // reset current page to 1, as otherwise we might be on a page that could no longer be valid
          // after changing the page size
          currentPage: 1,
        };
      }

      return { ...state, ...updateState };

    case viewPaginationConstants.SET_TOTAL_ITEMS:
      updatePageCounts(action.payload.viewType, action.payload.totalCount);

      return { ...state, ...updateState };

    case FULFILLED_ACTION(dashboardsConstants.GET_UNHEALTHY_CLUSTERS):
      updatePageCounts(viewConstants.OVERVIEW_VIEW, action.payload.data.total);
      return { ...state, ...updateState };

    case FULFILLED_ACTION(subscriptionsConstants.GET_SUBSCRIPTIONS):
      updatePageCounts(viewConstants.OVERVIEW_EXPIRED_TRIALS, action.payload.data.total);
      return { ...state, ...updateState };

    case FULFILLED_ACTION(GET_ACCESS_REQUESTS):
      updatePageCounts(viewConstants.ACCESS_REQUESTS_VIEW, action.payload.data.total);
      return { ...state, ...updateState };

    case REJECTED_ACTION(GET_ACCESS_REQUESTS):
      updatePageCounts(viewConstants.ACCESS_REQUESTS_VIEW, 0);
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_SET_LIST_FILTER:
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        filter: action.payload.filter,
        currentPage: 1,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_CHANGE_SORT:
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        sorting: action.payload.sorting,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_SET_LIST_FLAGS:
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        flags: {
          ...state[action.payload.viewType].flags,
          [action.payload.key]: action.payload.value,
        },
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_CLEAR_FILTERS_AND_FLAGS:
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        flags: INITIAL_OSL_VIEW_STATE.flags,
        filter:
          typeof INITIAL_OSL_VIEW_STATE.filter === 'object'
            ? {
                ...INITIAL_OSL_VIEW_STATE.filter,
                // time from and time to values are always ketps, since the values from the date picker don't change after clearing
                timestampFrom: (state[action.payload.viewType].filter as any).timestampFrom,
                timestampTo: (state[action.payload.viewType].filter as any).timestampTo,
              }
            : INITIAL_OSL_VIEW_STATE.filter,
      };
      return { ...state, ...updateState };

    case viewPaginationConstants.VIEW_RESET_FILTERS_AND_FLAGS:
      updateState[action.payload.viewType] = {
        ...state[action.payload.viewType],
        flags: INITIAL_OSL_VIEW_STATE.flags,
        filter: INITIAL_OSL_VIEW_STATE.filter,
      };
      return { ...state, ...updateState };

    default:
      return state;
  }
};

viewOptionsReducer.initialState = initialState;

export { initialState, viewOptionsReducer };

export default viewOptionsReducer;
