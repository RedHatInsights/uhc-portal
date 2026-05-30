import { GET_ACCESS_REQUESTS } from '../constants/accessRequestConstants';
import { ACCESS_REQUESTS_VIEW, CLUSTERS_VIEW } from '../constants/viewConstants';
import { VIEW_MY_CLUSTERS_ONLY_CHANGED } from '../constants/viewOptionsConstants';
import { SET_TOTAL_ITEMS } from '../constants/viewPaginationConstants';
import { FULFILLED_ACTION, REJECTED_ACTION } from '../reduxHelpers';

import { initialState, viewOptionsReducer } from './viewOptionsReducer';

describe('viewOptionsReducer', () => {
  it('returns the same state for an unknown action', () => {
    const result = viewOptionsReducer(initialState, {
      type: 'UNKNOWN_ACTION_FOR_VIEW_OPTIONS',
    } as any);

    expect(result).toBe(initialState);
  });

  describe('SET_TOTAL_ITEMS', () => {
    it('stores totalCount 0 for an empty list (does not coerce 0 to 1)', () => {
      const result = viewOptionsReducer(initialState, {
        type: SET_TOTAL_ITEMS,
        payload: { viewType: CLUSTERS_VIEW, totalCount: 0 },
      });

      expect(result[CLUSTERS_VIEW]).toMatchObject({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });
    });

    it('computes totalPages from totalCount and pageSize', () => {
      const result = viewOptionsReducer(initialState, {
        type: SET_TOTAL_ITEMS,
        payload: { viewType: CLUSTERS_VIEW, totalCount: 100 },
      });

      expect(result[CLUSTERS_VIEW]).toMatchObject({
        totalCount: 100,
        totalPages: 2,
        pageSize: 50,
        currentPage: 1,
      });
    });

    it('clamps currentPage when total shrinks (non-empty) and resets to page 1 when empty', () => {
      const stateWithHighPage = {
        ...initialState,
        [CLUSTERS_VIEW]: {
          ...initialState[CLUSTERS_VIEW],
          currentPage: 3,
          totalCount: 150,
          totalPages: 3,
        },
      };

      const resultEmpty = viewOptionsReducer(stateWithHighPage, {
        type: SET_TOTAL_ITEMS,
        payload: { viewType: CLUSTERS_VIEW, totalCount: 0 },
      });

      expect(resultEmpty[CLUSTERS_VIEW]).toMatchObject({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });

      // Non-empty clamp: pageSize 50 and totalCount 75 → totalPages 2; currentPage → min(3, 2) = 2
      const resultFewerPages = viewOptionsReducer(stateWithHighPage, {
        type: SET_TOTAL_ITEMS,
        payload: { viewType: CLUSTERS_VIEW, totalCount: 75 },
      });

      expect(resultFewerPages[CLUSTERS_VIEW]).toMatchObject({
        totalCount: 75,
        totalPages: 2,
        currentPage: 2,
      });
    });
  });

  describe('VIEW_MY_CLUSTERS_ONLY_CHANGED', () => {
    it('updates showMyClustersOnly without changing pagination totals', () => {
      const stateWithTotal = {
        ...initialState,
        [CLUSTERS_VIEW]: {
          ...initialState[CLUSTERS_VIEW],
          totalCount: 42,
          totalPages: 1,
          currentPage: 1,
        },
      };

      const result = viewOptionsReducer(stateWithTotal, {
        type: VIEW_MY_CLUSTERS_ONLY_CHANGED,
        viewType: CLUSTERS_VIEW,
        payload: { showMyClustersOnly: true },
      } as any);

      expect(result[CLUSTERS_VIEW].flags?.showMyClustersOnly).toBe(true);
      expect(result[CLUSTERS_VIEW].totalCount).toBe(42);
      expect(result[CLUSTERS_VIEW].totalPages).toBe(1);
    });
  });

  describe('GET_ACCESS_REQUESTS', () => {
    it('sets access requests view totals from fulfilled payload', () => {
      const result = viewOptionsReducer(initialState, {
        type: FULFILLED_ACTION(GET_ACCESS_REQUESTS),
        payload: { data: { total: 7 } },
      } as any);

      expect(result[ACCESS_REQUESTS_VIEW]).toMatchObject({
        totalCount: 7,
        totalPages: 1,
        pageSize: 20,
      });
    });

    it('sets access requests totals to 0 on rejected fetch', () => {
      const result = viewOptionsReducer(initialState, {
        type: REJECTED_ACTION(GET_ACCESS_REQUESTS),
        payload: {},
      } as any);

      expect(result[ACCESS_REQUESTS_VIEW]).toMatchObject({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });
    });
  });
});
