import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { mockOCPLifeCycleStatusData } from '~/components/clusters/wizards/rosa/ClusterSettings/VersionSelection.fixtures';
import * as ReleaseHooks from '~/components/releases/hooks';
import { mockRestrictedEnv, mockUseChrome, screen, withState } from '~/testUtils';
import { ProductLifeCycle } from '~/types/product-life-cycles';

import Router from './Router';

const routes = [
  { path: '/cluster-list', metadata: { ocm_resource_type: 'all' } },
  { path: '/token/rosa', metadata: { ocm_resource_type: 'moa' } },
  { path: '/token/rosa/show', metadata: { ocm_resource_type: 'moa' } },
  { path: '/details/:id', metadata: { ocm_resource_type: 'all' } },
  {
    path: '/details/s/:id',
    metadata: {
      ocm_cluster_id: 'test-cluster',
      ocm_resource_type: 'unknown',
      title: 'View Cluster',
      path: '/openshift/details/s',
    },
  },
  {
    path: '/details/s/:id/add-idp/:idpTypeName',
    metadata: {
      ocm_cluster_id: 'test-cluster',
      ocm_resource_type: 'unknown',
      title: 'Add IdP',
      path: '/openshift/details/s/add-idp',
    },
  },
  {
    path: '/details/s/:id/edit-idp/:idpName',
    metadata: {
      ocm_cluster_id: 'test-cluster',
      ocm_resource_type: 'unknown',
      title: 'Edit IdP',
      path: '/openshift/details/s/edit-idp',
    },
  },
  { path: '/create/osd', metadata: { ocm_resource_type: 'osd' } },
  { path: '/register', metadata: { ocm_resource_type: 'ocp' } },
  { path: '/archived', metadata: { ocm_resource_type: 'all' } },
];

const routesWithLoading = [
  { path: '/token', metadata: { ocm_resource_type: 'all' } },
  { path: '/token/show', metadata: { ocm_resource_type: 'all' } },
  { path: '/downloads', metadata: { ocm_resource_type: 'all' } },
  { path: '/quota', metadata: { ocm_resource_type: 'all' } },
];

const createRoute = [{ path: '/create', metadata: { ocm_resource_type: 'all' } }];

const releasesRoute = [{ path: '/releases', metadata: { ocm_resource_type: 'ocp' } }];

const routesWithRedirects = [
  { path: '/install', redirect: '/create' },
  { path: '/create/osd/aws', redirect: '/create/osd' },
  { path: '/create/osd/gcp', redirect: '/create/osd' },
];

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const initialState = {
  userProfile: { keycloakProfile: { username: 'MyUserName' } },
  clusters: {
    clusters: {
      errorMessage: '',
      cluster: {
        kind: 'Cluster',
        id: '1IztzhAGrbjtKkMbiPewJanhTXk',
      },
    },
    details: {
      cluster: {
        subscription: {
          cluster_id: 'test-cluster',
        },
      },
    },
  },
  form: { CreateIdentityProvider: { syncErrors: { users: { _error: 'I am a HTPasswdError' } } } },
  accessProtection: {
    organizationAccessProtection: {
      enabled: {},
    },
  },
};

const useOCPLifeCycleStatusDataSpy = jest.spyOn(ReleaseHooks, 'useOCPLifeCycleStatusData');

const xhrMockClass = () => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
});

(window as any).XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);

describe('Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // /releases route needs this
    useOCPLifeCycleStatusDataSpy.mockReturnValue(
      mockOCPLifeCycleStatusData as [ProductLifeCycle[] | undefined, boolean],
    );
  });

  mockRestrictedEnv();
  const mockSetPageMetadata = jest.fn();
  mockUseChrome({
    segment: {
      setPageMetadata: mockSetPageMetadata,
    },
  });

  describe('Every route should render: ', () => {
    test.each(routes)('%s', async (route) => {
      const { path, metadata } = route;
      withState(initialState, true).render(
        <MemoryRouter initialEntries={[{ pathname: path }]}>
          <Router />
        </MemoryRouter>,
        { withRouter: false },
      );

      expect(screen.queryByTestId('not-found')).not.toBeInTheDocument();
      expect(mockSetPageMetadata).toHaveBeenLastCalledWith(metadata);
    });

    test.each(routesWithLoading)('%s', async (route) => {
      const { path, metadata } = route;
      withState(initialState, true).render(
        <MemoryRouter initialEntries={[{ pathname: path }]}>
          <Router />
        </MemoryRouter>,
        { withRouter: false },
      );

      expect(screen.queryByTestId('not-found')).not.toBeInTheDocument();
      expect(mockSetPageMetadata).toHaveBeenLastCalledWith(metadata);
    });

    test.each(createRoute)('%s', async (route) => {
      const { path, metadata } = route;
      withState(initialState, true).render(
        <MemoryRouter initialEntries={[{ pathname: path }]}>
          <Router />
        </MemoryRouter>,
        { withRouter: false },
      );

      expect(screen.queryByTestId('not-found')).not.toBeInTheDocument();
      expect(mockSetPageMetadata).toHaveBeenLastCalledWith(metadata);
    });

    test.each(releasesRoute)('%s', async (route) => {
      const { path, metadata } = route;
      withState(initialState, true).render(
        <MemoryRouter initialEntries={[{ pathname: path }]}>
          <Router />
        </MemoryRouter>,
        { withRouter: false },
      );

      expect(screen.queryByTestId('not-found')).not.toBeInTheDocument();
      expect(mockSetPageMetadata).toHaveBeenLastCalledWith(metadata);
    });

    test.each(routesWithRedirects)('%s', async (route) => {
      const { path, redirect } = route;
      withState(initialState, true).render(
        <MemoryRouter initialEntries={[{ pathname: path }]}>
          <LocationDisplay />
          <Router />
        </MemoryRouter>,
        { withRouter: false },
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent(`/openshift${redirect}`);
    });
  });
});
