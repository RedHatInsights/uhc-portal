import React from 'react';

import * as useFetchClusters from '~/queries/ClusterListQueries/useFetchClusters';
import { checkAccessibility, screen, withState } from '~/testUtils';

import { ClustersPageHeader } from './ClustersPageHeader';

// Mock child components to simplify testing
jest.mock('../ClusterListMultiRegion/components/RefreshButton', () => ({
  RefreshButton: ({ refreshFunc }: { refreshFunc: () => void }) => (
    <button type="button" data-testid="refresh-button" onClick={refreshFunc}>
      Refresh
    </button>
  ),
}));

jest.mock('../common/ErrorTriangle', () => ({
  __esModule: true,
  default: ({ errorMessage, item }: { errorMessage?: string; item: string }) => (
    <div data-testid="error-triangle">
      Error for {item}: {errorMessage || 'Unknown error'}
    </div>
  ),
}));

// Mock the hooks
const mockRefetchClusters = jest.fn();
const mockRefetchClusterTransferDetail = jest.fn();

const mockedUseFetchClusters = jest.spyOn(useFetchClusters, 'useFetchClusters');

const mockUseFetchClusterTransferDetail = jest.fn();

jest.mock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails',
  () => ({
    useFetchClusterTransferDetail: (...args: any[]) => mockUseFetchClusterTransferDetail(...args),
    refetchClusterTransferDetail: () => mockRefetchClusterTransferDetail(),
  }),
);

describe('<ClustersPageHeader />', () => {
  const defaultClustersHookReturn = {
    isLoading: false,
    refetch: mockRefetchClusters,
    isFetching: false,
    isError: false,
    errors: [],
    data: { items: [], itemsCount: 0 },
    isFetched: true,
    isClustersDataPending: false,
  };

  const defaultTransferHookReturn = {
    isLoading: false,
    isError: false,
  };

  beforeEach(() => {
    mockedUseFetchClusters.mockReturnValue(defaultClustersHookReturn as any);
    mockUseFetchClusterTransferDetail.mockReturnValue(defaultTransferHookReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the page header with title', () => {
      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByRole('heading', { name: 'Clusters', level: 1 })).toBeInTheDocument();
    });

    it('renders the refresh button', () => {
      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });

    it('does not show spinner when not loading', () => {
      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(
        screen.queryByRole('progressbar', { name: 'Loading cluster data' }),
      ).not.toBeInTheDocument();
    });

    it('does not show error triangle when no errors', () => {
      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.queryByTestId('error-triangle')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows spinner when clusters are loading', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isLoading: true,
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByRole('progressbar', { name: 'Loading cluster data' })).toBeInTheDocument();
    });

    it('shows spinner when clusters are fetching', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isFetching: true,
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByRole('progressbar', { name: 'Loading cluster data' })).toBeInTheDocument();
    });

    it('shows spinner when cluster transfers are loading', () => {
      mockUseFetchClusterTransferDetail.mockReturnValue({
        isLoading: true,
        isError: false,
      });

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByRole('progressbar', { name: 'Loading cluster data' })).toBeInTheDocument();
    });

    it('does not show spinner when all data is loaded', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isLoading: false,
        isFetching: false,
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(
        screen.queryByRole('progressbar', { name: 'Loading cluster data' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error triangle when clusters have an error', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isError: true,
        errors: [{ reason: 'Failed to load clusters' }],
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByTestId('error-triangle')).toBeInTheDocument();
      expect(screen.getByText(/Error for clusters: Failed to load clusters/)).toBeInTheDocument();
    });

    it('shows error triangle when cluster transfers have an error', () => {
      mockUseFetchClusterTransferDetail.mockReturnValue({
        isLoading: false,
        isError: true,
      });

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByTestId('error-triangle')).toBeInTheDocument();
    });

    it('shows error triangle with message from clusters error', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isError: true,
        errors: [{ reason: 'Network timeout' }],
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByText(/Network timeout/)).toBeInTheDocument();
    });

    it('shows error triangle without specific message when error has no reason', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isError: true,
        errors: [],
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByTestId('error-triangle')).toBeInTheDocument();
      expect(screen.getByText(/Unknown error/)).toBeInTheDocument();
    });

    it('does not show error triangle when there are no errors', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isError: false,
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.queryByTestId('error-triangle')).not.toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('calls both refetch functions when refresh button is clicked on list tab', async () => {
      const { user } = withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      expect(mockRefetchClusters).toHaveBeenCalledTimes(1);
      expect(mockRefetchClusterTransferDetail).toHaveBeenCalledTimes(1);
    });

    it('only calls cluster transfer refetch when refresh button is clicked on transfers tab', async () => {
      const { user } = withState({}, true).render(<ClustersPageHeader activeTabKey="transfers" />);

      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      expect(mockRefetchClusters).not.toHaveBeenCalled();
      expect(mockRefetchClusterTransferDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combined States', () => {
    it('shows both spinner and error when loading and has previous error', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isLoading: true,
        isError: true,
        errors: [{ reason: 'Previous error' }],
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(screen.getByRole('progressbar', { name: 'Loading cluster data' })).toBeInTheDocument();
      expect(screen.getByTestId('error-triangle')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('calls useFetchClusters with correct parameters', () => {
      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(mockedUseFetchClusters).toHaveBeenCalledWith(false, true);
    });

    it('passes username to useFetchClusterTransferDetail', () => {
      const state = {
        userProfile: {
          keycloakProfile: {
            username: 'test-user',
          },
        },
      };

      withState(state, true).render(<ClustersPageHeader activeTabKey="list" />);

      expect(mockUseFetchClusterTransferDetail).toHaveBeenCalledWith({
        username: 'test-user',
      });
    });
  });

  describe('Accessibility', () => {
    it('is accessible', async () => {
      const { container } = withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);
      await checkAccessibility(container);
    });
    it('has proper heading level for title', () => {
      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      const heading = screen.getByRole('heading', { name: 'Clusters' });
      expect(heading.tagName).toBe('H1');
    });

    it('has proper aria-label for loading spinner', () => {
      mockedUseFetchClusters.mockReturnValue({
        ...defaultClustersHookReturn,
        isLoading: true,
      } as any);

      withState({}, true).render(<ClustersPageHeader activeTabKey="list" />);

      const spinner = screen.getByRole('progressbar', { name: 'Loading cluster data' });
      expect(spinner).toHaveAttribute('aria-label', 'Loading cluster data');
    });
  });
});
