import React from 'react';
import * as reactRedux from 'react-redux';

import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useCanUpdateDeleteProtection } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { ALLOW_EUS_CHANNEL } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import DeleteProtection from '../DeleteProtection';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/components/common/Modal/ModalActions');

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  ...jest.requireActual('~/queries/ClusterDetailsQueries/useFetchActionsPermissions'),
  useCanUpdateDeleteProtection: jest.fn(),
}));

const mockUseCanUpdateDeleteProtection = useCanUpdateDeleteProtection as jest.Mock;

describe('<DeleteProtection />', () => {
  beforeEach(() => {
    mockUseCanUpdateDeleteProtection.mockReturnValue({
      canUpdateDeleteProtection: true,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('Shows cluster delete protection is enabled', () => {
    mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
    };
    render(<DeleteProtection {...props} />);
    expect(screen.getByText('Delete Protection')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('Shows cluster delete protection is disabled', () => {
    mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
    };
    render(<DeleteProtection {...props} />);
    expect(screen.getByText('Delete Protection')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('Disables the "Enable" button if not enough permission', () => {
    mockUseCanUpdateDeleteProtection.mockReturnValue({
      canUpdateDeleteProtection: false,
      isLoading: false,
      isError: false,
      error: null,
    });
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Enable delete protection' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Disables the "Disable" button if not enough permission', () => {
    mockUseCanUpdateDeleteProtection.mockReturnValue({
      canUpdateDeleteProtection: false,
      isLoading: false,
      isError: false,
      error: null,
    });
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Disable delete protection' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Disables the button while permission is loading', () => {
    mockUseCanUpdateDeleteProtection.mockReturnValue({
      canUpdateDeleteProtection: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Disable delete protection' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Disables the "Disable" button if cluster details is pending', () => {
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
      pending: true,
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Disable delete protection' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Displays N/A when cluster is uninstalling', () => {
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
      isUninstalling: true,
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

describe('Delete protection - modal action', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  beforeEach(() => {
    mockUseCanUpdateDeleteProtection.mockReturnValue({
      canUpdateDeleteProtection: true,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    useDispatchMock.mockClear();
    mockedDispatch.mockClear();
  });

  it('Opens the modal', async () => {
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
    };
    const { user } = render(<DeleteProtection {...props} />);
    await user.click(screen.getByRole('button'));
    expect(openModal).toHaveBeenCalledWith(modals.DELETE_PROTECTION, {
      clusterID: 'fake-cluster',
      protectionEnabled: false,
    });
  });
});
