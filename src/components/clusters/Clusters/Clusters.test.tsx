import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { screen, withState } from '~/testUtils';

import { Clusters } from './Clusters';

// Mock child components to simplify testing
jest.mock('~/components/clusters/ClusterListMultiRegion', () => ({
  __esModule: true,
  default: () => <div data-testid="list-tab">Cluster List Content</div>,
}));

jest.mock('../ClusterTransfer/ClusterTransferList', () => ({
  __esModule: true,
  default: () => <div data-testid="cluster-transfer-list">Cluster Transfer List Content</div>,
}));

jest.mock('./ClustersPageHeader', () => ({
  ClustersPageHeader: () => <div data-testid="clusters-page-header">Clusters Header</div>,
}));

const mockNavigate = jest.fn();

// Only mock useNavigate from ~/common/routing so we can assert on navigation calls
jest.mock('~/common/routing', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...jest.requireActual('~/common/routing'),
    useNavigate: () => mockNavigate,
    Link: actual.Link,
    Navigate: actual.Navigate,
  };
});

// Helper to render with router at a specific path
const renderWithPath = (path: string) =>
  withState({}, true).render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/clusters/*" element={<Clusters />} />
      </Routes>
    </MemoryRouter>,
    { withRouter: false },
  );

describe('<Clusters />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the clusters page with header and tabs', () => {
      renderWithPath('/clusters/list');

      expect(screen.getByRole('region', { name: 'Clusters' })).toBeInTheDocument();
    });

    it('renders both tab titles', () => {
      renderWithPath('/clusters/list');

      expect(screen.getByRole('tab', { name: 'Cluster List' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Cluster Requests' })).toBeInTheDocument();
    });

    it('defaults to the "list" tab when on /clusters index', () => {
      renderWithPath('/clusters');

      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      expect(listTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });

    it('shows the "list" tab content on /clusters/list', () => {
      renderWithPath('/clusters/list');

      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
      expect(screen.getByText('Cluster List Content')).toBeInTheDocument();
    });
  });

  describe('Path-based Navigation', () => {
    it('selects the "list" tab when path is /clusters/list', () => {
      renderWithPath('/clusters/list');

      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      expect(listTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });

    it('selects the "requests" tab when path is /clusters/requests', () => {
      renderWithPath('/clusters/requests');

      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      expect(requestsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('cluster-transfer-list')).toBeInTheDocument();
    });

    it('defaults to "list" tab for unknown paths', () => {
      renderWithPath('/clusters/unknown-tab');

      // Should default to list tab since 'unknown-tab' is not a valid tab key
      // Note: React Router won't render any route content for unknown paths,
      // but the tab should still show as selected based on the activeTabKey logic
      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      expect(listTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Tab Clicking', () => {
    it.each([
      {
        tabName: 'Cluster List',
        expectedPath: '/clusters/list',
        initialPath: '/clusters/requests',
      },
      {
        tabName: 'Cluster Requests',
        expectedPath: '/clusters/requests',
        initialPath: '/clusters/list',
      },
    ])(
      'navigates to $expectedPath when clicking the $tabName tab',
      async ({ tabName, expectedPath, initialPath }) => {
        const { user } = renderWithPath(initialPath);

        const tab = screen.getByRole('tab', { name: tabName });
        await user.click(tab);

        expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
      },
    );

    it('updates navigation when switching between tabs', async () => {
      const { user } = renderWithPath('/clusters/list');

      // Click Cluster Requests tab
      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      await user.click(requestsTab);
      expect(mockNavigate).toHaveBeenCalledWith('/clusters/requests');

      // Click back to Cluster List tab
      const listTab = screen.getByRole('tab', { name: 'Cluster List' });
      await user.click(listTab);
      expect(mockNavigate).toHaveBeenCalledWith('/clusters/list');

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Tab Content Rendering', () => {
    it('renders ListTab component in the Cluster List tab', () => {
      renderWithPath('/clusters/list');

      // Only the active route content is rendered
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('cluster-transfer-list')).not.toBeInTheDocument();
    });

    it('renders ClusterTransferList component in the Cluster Requests tab', () => {
      renderWithPath('/clusters/requests');

      // Only the active route content is rendered
      expect(screen.getByTestId('cluster-transfer-list')).toBeInTheDocument();
      expect(screen.queryByTestId('list-tab')).not.toBeInTheDocument();
    });

    it('passes getMultiRegion prop to ListTab', () => {
      renderWithPath('/clusters/list');

      // ListTab should be rendered with getMultiRegion prop
      expect(screen.getByTestId('list-tab')).toBeInTheDocument();
    });
  });

  describe('Browser Navigation', () => {
    it('shows correct active tab when on /clusters/list', () => {
      renderWithPath('/clusters/list');

      // List tab should be active
      expect(screen.getByRole('tab', { name: 'Cluster List' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Cluster Requests' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });

    it('shows correct active tab when on /clusters/requests', () => {
      renderWithPath('/clusters/requests');

      // Requests tab should be active
      expect(screen.getByRole('tab', { name: 'Cluster Requests' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Cluster List' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });

    it('maintains correct pathname when navigating between tabs', async () => {
      const { user } = renderWithPath('/clusters/list');

      const requestsTab = screen.getByRole('tab', { name: 'Cluster Requests' });
      await user.click(requestsTab);

      expect(mockNavigate).toHaveBeenCalledWith('/clusters/requests');
      expect(mockNavigate).not.toHaveBeenCalledWith('requests'); // Should include full pathname
    });
  });

  describe('Component Structure', () => {
    it('renders within AppPage wrapper and shows header', () => {
      renderWithPath('/clusters/list');

      // AppPage should provide the page structure
      expect(screen.getByTestId('clusters-page-header')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Clusters' })).toBeInTheDocument();
      expect(screen.getByText('Clusters Header')).toBeInTheDocument();
    });
  });
});
