import React from 'react';

import * as useFetchClusters from '~/queries/ClusterListQueries/useFetchClusters';
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
  describe('ArchivedClusterList', () => {
    it('is accessible', async () => {
      mockedGetFetchedClusters.mockReturnValue({
        data: { items: Fixtures.clusters },
        isLoading: false,
        isFetching: false,
        isFetched: true,
        errors: [],
      });

      const props = {
        getCloudProviders: jest.fn(),
        cloudProviders: Fixtures.cloudProviders,
        closeModal: jest.fn(),
        clearGlobalError: jest.fn(),
        openModal: jest.fn(),
        getMultiRegion: false,
      };
      const { container } = withState({}, true).render(<ArchivedClusterList {...props} />);

      expect(await screen.findByRole('grid')).toBeInTheDocument();

      await checkAccessibility(container);
    });
  });
});
