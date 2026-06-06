import React from 'react';
import * as reactRedux from 'react-redux';

import * as useFetchClusters from '~/queries/ClusterListQueries/useFetchClusters';
import { SET_TOTAL_ITEMS } from '~/redux/constants/viewPaginationConstants';
import { checkAccessibility, screen, withState } from '~/testUtils';

import ArchivedClusterList from '../../../ArchivedClusterList';

import * as Fixtures from './ArchivedClusterList.fixtures';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedGetFetchedClusters = jest.spyOn(useFetchClusters, 'useFetchClusters');

describe('<ArchivedClusterList />', () => {
  const props = {
    getCloudProviders: jest.fn(),
    cloudProviders: Fixtures.cloudProviders,
    closeModal: jest.fn(),
    clearGlobalError: jest.fn(),
    openModal: jest.fn(),
    getMultiRegion: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ArchivedClusterList', () => {
    it('is accessible', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: Fixtures.clusters },
        isLoading: false,
        isFetching: false,
        isFetched: true,
        errors: [],
      });

      const { container } = withState({}, true).render(<ArchivedClusterList {...props} />);

      expect(await screen.findByRole('grid')).toBeInTheDocument();

      await checkAccessibility(container);
    });

    it('sets new cluster total into Redux', () => {
      const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);

      mockedGetFetchedClusters.mockReturnValue({
        data: { items: Fixtures.clusters, itemsCount: 1 },
        isLoading: false,
        isFetching: false,
        isFetched: true,
        errors: [],
      });

      withState({}, true).render(<ArchivedClusterList {...props} />);

      const setTotalCall = mockedDispatch.mock.calls.find(
        ([action]) => action.type === SET_TOTAL_ITEMS,
      );
      expect(setTotalCall).toBeDefined();
      expect(setTotalCall[0].payload).toEqual({
        totalCount: 1,
        viewType: 'ARCHIVED_CLUSTERS_VIEW',
      });
    });

    it('sets new cluster total when total is changed to 0', () => {
      const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);

      mockedGetFetchedClusters.mockReturnValue({
        data: { items: [], itemsCount: 0 },
        isLoading: false,
        isFetching: false,
        isFetched: true,
        errors: [],
      });

      withState({ viewOptions: { ARCHIVED_CLUSTERS_VIEW: { totalCount: 1 } } }, true).render(
        <ArchivedClusterList {...props} />,
      );

      const setTotalCall = mockedDispatch.mock.calls.find(
        ([action]) => action.type === SET_TOTAL_ITEMS,
      );
      expect(setTotalCall).toBeDefined();
      expect(setTotalCall[0].payload).toEqual({
        totalCount: 0,
        viewType: 'ARCHIVED_CLUSTERS_VIEW',
      });
    });
  });
});
