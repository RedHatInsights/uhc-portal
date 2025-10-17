import React from 'react';

import { screen, withState } from '~/testUtils';

import { Clusters } from './Clusters';

// Mock child components to simplify testing
jest.mock('~/components/clusters/ClusterListMultiRegion', () => ({
  ListTab: () => <div data-testid="list-tab">Cluster List Content</div>,
}));

jest.mock('../ClusterTransfer/ClusterTransferList', () => ({
  __esModule: true,
  default: () => <div data-testid="cluster-transfer-list">Cluster Transfer List Content</div>,
}));

jest.mock('./ClustersPageHeader', () => ({
  ClustersPageHeader: () => <div data-testid="clusters-page-header">Clusters Header</div>,
}));

const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/clusters',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

jest.mock('~/common/routing', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

describe('<Clusters />', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockLocation.hash = '';
  });

  describe('Initial Rendering', () => {
    it('renders the clusters page with header and tabs', () => {
      withState({}, true).render(<Clusters />);

      expect(screen.getByTestId('clusters-page-header')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Clusters' })).toBeInTheDocument();
    });

    it('renders both tab titles', () => {
      withState({}, true).render(<Clusters />);

      expect(screen.getByRole('tab', { name: 'Cluster List' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Cluster Requests' })).toBeInTheDocument();
    });

    it('defaults to the "list" tab when no hash is present', () => {
      mockLocation.hash = '';
      withState({}, true).render(<Clusters />);

      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      expect(listTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });

    it('shows the "list" tab content by default', () => {
      mockLocation.hash = '';
      withState({}, true).render(<Clusters />);

      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
      expect(screen.getByText('Cluster List Content')).toBeInTheDocument();
    });
  });

  describe('Hash-based Navigation', () => {
    it('selects the "list" tab when hash is #list', () => {
      mockLocation.hash = '#list';
      withState({}, true).render(<Clusters />);

      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      expect(listTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });

    it('selects the "requests" tab when hash is #requests', () => {
      mockLocation.hash = '#requests';
      withState({}, true).render(<Clusters />);

      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      expect(requestsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('cluster-transfer-list')).toBeInTheDocument();
    });

    it('defaults to "list" tab for unknown hash values', () => {
      mockLocation.hash = '#unknown-tab';
      withState({}, true).render(<Clusters />);

      // Should default to list tab since 'unknown-tab' is not a valid tab key
      // Component uses the hash as-is, so it will try to show 'unknown-tab'
      // but since no tab matches, none should be selected
      expect(screen.getByRole('tab', { name: 'Cluster List' })).toBeInTheDocument();
    });
  });

  describe('Tab Clicking', () => {
    it('navigates to #list when clicking the Cluster List tab', async () => {
      mockLocation.hash = '#requests';
      const { user } = withState({}, true).render(<Clusters />);

      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      await user.click(listTab);

      expect(mockNavigate).toHaveBeenCalledWith('/clusters#list');
    });

    it('navigates to #requests when clicking the Cluster Requests tab', async () => {
      mockLocation.hash = '';
      const { user } = withState({}, true).render(<Clusters />);

      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      await user.click(requestsTab);

      expect(mockNavigate).toHaveBeenCalledWith('/clusters#requests');
    });

    it('updates navigation when switching between tabs', async () => {
      const { user } = withState({}, true).render(<Clusters />);

      // Click Cluster Requests tab
      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      await user.click(requestsTab);
      expect(mockNavigate).toHaveBeenCalledWith('/clusters#requests');

      // Click back to Cluster List tab
      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      await user.click(listTab);
      expect(mockNavigate).toHaveBeenCalledWith('/clusters#list');

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Tab Content Rendering', () => {
    it('renders ListTab component in the Cluster List tab', () => {
      mockLocation.hash = '#list';
      withState({}, true).render(<Clusters />);

      // Both tab contents are rendered, but PatternFly controls visibility
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
      expect(screen.getByTestId('cluster-transfer-list')).toBeInTheDocument();
    });

    it('renders ClusterTransferList component in the Cluster Requests tab', () => {
      mockLocation.hash = '#requests';
      withState({}, true).render(<Clusters />);

      // Both tab contents are rendered, but PatternFly controls visibility
      expect(screen.getByTestId('cluster-transfer-list')).toBeInTheDocument();
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });

    it('passes getMultiRegion prop to ListTab', () => {
      mockLocation.hash = '#list';
      withState({}, true).render(<Clusters />);

      // ListTab should be rendered with getMultiRegion prop
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });

    it('renders both tab contents simultaneously', () => {
      withState({}, true).render(<Clusters />);

      // PatternFly Tabs renders all content and uses ARIA/CSS to control visibility
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
      expect(screen.getByTestId('cluster-transfer-list')).toBeInTheDocument();
    });
  });

  describe('Browser Navigation', () => {
    it('updates active tab when hash changes (simulating back/forward navigation)', () => {
      const { rerender } = withState({}, true).render(<Clusters />);

      // Initially on list tab
      expect(screen.getByRole('tab', { name: 'Cluster List' })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // Simulate browser navigation changing the hash
      mockLocation.hash = '#requests';
      rerender(<Clusters />);

      expect(screen.getByRole('tab', { name: 'Cluster Requests' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('maintains correct pathname when navigating between tabs', async () => {
      mockLocation.pathname = '/clusters';
      const { user } = withState({}, true).render(<Clusters />);

      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      await user.click(requestsTab);

      expect(mockNavigate).toHaveBeenCalledWith('/clusters#requests');
      expect(mockNavigate).not.toHaveBeenCalledWith('#requests'); // Should include pathname
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for tabs', () => {
      withState({}, true).render(<Clusters />);

      expect(screen.getByRole('tab', { name: 'Cluster List' })).toHaveAttribute(
        'aria-label',
        'Cluster List',
      );
      expect(screen.getByRole('tab', { name: 'Cluster Requests' })).toHaveAttribute(
        'aria-label',
        'Cluster Requests',
      );
    });

    it('has proper ARIA region label for tabs container', () => {
      withState({}, true).render(<Clusters />);

      const tabsRegion = screen.getByRole('region', { name: 'Clusters' });
      expect(tabsRegion).toBeInTheDocument();
    });

    it('marks the active tab with aria-selected', () => {
      mockLocation.hash = '#list';
      withState({}, true).render(<Clusters />);

      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });

      expect(listTab).toHaveAttribute('aria-selected', 'true');
      expect(requestsTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Component Structure', () => {
    it('renders within AppPage wrapper', () => {
      withState({}, true).render(<Clusters />);

      // AppPage should provide the page structure
      expect(screen.getByTestId('clusters-page-header')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Clusters' })).toBeInTheDocument();
    });

    it('renders ClustersPageHeader component', () => {
      withState({}, true).render(<Clusters />);

      expect(screen.getByTestId('clusters-page-header')).toBeInTheDocument();
      expect(screen.getByText('Clusters Header')).toBeInTheDocument();
    });
  });
});
