import React from 'react';
import * as reactRedux from 'react-redux';
import * as reactRouter from 'react-router-dom';

import { useFetchHtpasswdUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchHtpasswdUsers';
import { ENHANCED_HTPASSWRD } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, waitFor, within } from '~/testUtils';

import IdentityProvidersPage from './IdentityProvidersPage';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});
jest.mock('react-router-dom', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-router-dom'),
    Navigate: jest.fn(({ to }) => `Redirected to "${to}"`),
  };
  return config;
});

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  useFetchClusterDetails: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/IDPPage/usePostIDPForm', () => ({
  usePostIDPForm: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterIdentityProviders', () => ({
  useFetchClusterIdentityProviders: jest.fn(),
  refetchClusterIdentityProviders: jest.fn(),
}));

const sampleCluster = {
  managed: true,
  id: 'myClusterId',
  subscription: {
    id: 'mySubscriptionId',
    status: 'Ready',
    display_name: 'myCluster',
  },
  console: { url: 'my_console_url' },
  api: { url: 'my_api_url' },
};

jest.mock(
  '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchHtpasswdUsers',
  () => ({
    useFetchHtpasswdUsers: jest.fn(),
  }),
);

describe('<IdentityProvidersPage />', () => {
  const useFetchClusterDetailsMock = jest.requireMock(
    '~/queries/ClusterDetailsQueries/useFetchClusterDetails',
  );

  useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
    cluster: sampleCluster,
    isLoading: false,
    isError: false,
    error: null,
  });

  const useFetchClusterIdentityProvidersMock = jest.requireMock(
    '~/queries/ClusterDetailsQueries/useFetchClusterIdentityProviders',
  );

  useFetchClusterIdentityProvidersMock.useFetchClusterIdentityProviders.mockReturnValue({
    clusterIdentityProviders: {
      items: [
        {
          name: 'gitHubIDP',
          type: 'GithubIdentityProvider',
          id: 'id1',
        },
        {
          name: 'myHTPasswdIDP',
          type: 'HTPasswdIdentityProvider',
          id: 'id2',
        },
      ],
    },
    isLoading: false,
    isError: false,
    isSuccess: true,
  });

  useFetchClusterIdentityProvidersMock.refetchClusterIdentityProviders.mockReturnValue(jest.fn());

  const usePostIDPFormsMock = jest.requireMock(
    '~/queries/ClusterDetailsQueries/IDPPage/usePostIDPForm',
  );

  usePostIDPFormsMock.usePostIDPForm.mockReturnValue({
    mutate: () => {},
  });

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const useParamsMock = jest.spyOn(reactRouter, 'useParams');

  const useFetchHtpasswdUsersMocked = useFetchHtpasswdUsers as jest.Mock;

  useFetchHtpasswdUsersMocked.mockReturnValue({
    isLoading: false,
    users: [
      { username: 'myUser1', id: 'userId1' },
      { username: 'myUser2', id: 'userId2' },
    ],
    isError: false,
    error: null,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays htpasswd page if provided idp is htpasswd and has ipd.update access', async () => {
    mockUseFeatureGate([[ENHANCED_HTPASSWRD, true]]);
    useParamsMock.mockReturnValue({ id: 'mySubscriptionId', idpName: 'myHTPasswdIDP' });

    useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
      cluster: { ...sampleCluster, idpActions: { update: true } },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<IdentityProvidersPage isEditForm />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: 'Edit identity provider: myHTPasswdIDP' }),
    ).toBeInTheDocument();

    const userTable = screen.getByRole('grid');

    const headerRow = within(userTable).getAllByRole('row')[0];
    const firstDataRow = within(userTable).getAllByRole('row')[1];

    expect(within(headerRow).getByRole('columnheader', { name: 'Username' })).toBeInTheDocument();

    expect(within(firstDataRow).getByRole('cell', { name: 'myUser1' })).toBeInTheDocument();
  });

  it('navigates to cluster details if user does not have ipd.update access', async () => {
    mockUseFeatureGate([[ENHANCED_HTPASSWRD, true]]);
    useParamsMock.mockReturnValue({ id: 'mySubscriptionId', idpName: 'myHTPasswdIDP' });

    useFetchClusterDetailsMock.useFetchClusterDetails.mockReturnValue({
      cluster: { ...sampleCluster, idpActions: { update: false } },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<IdentityProvidersPage isEditForm />);
    expect(
      screen.getByText('Redirected to "/openshift/details/s/mySubscriptionId#accessControl"'),
    ).toBeInTheDocument();
  });
});
