import React from 'react';
import * as reactRedux from 'react-redux';

import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
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

describe('<DeleteProtection />', () => {
  it('Shows cluster delete protection is enabled', () => {
    mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
      canToggle: true,
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
      canToggle: true,
    };
    render(<DeleteProtection {...props} />);
    expect(screen.getByText('Delete Protection')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('Disables the "Enable" button if not enough permission', () => {
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
      canToggle: false,
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Enable' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('Disables the "Disable" button if not enough permission', () => {
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
      canToggle: false,
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Disable' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Disables the "Disable" button if cluster details is pending', () => {
    const props = {
      protectionEnabled: true,
      clusterID: 'fake-cluster',
      pending: true,
      canToggle: true,
    };
    render(<DeleteProtection {...props} />);

    expect(screen.getByRole('button', { name: 'Disable' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Displays N/A when cluster is uninstalling', () => {
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
      canToggle: true,
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

  afterEach(() => {
    useDispatchMock.mockClear();
    mockedDispatch.mockClear();
  });

  it('Opens the modal', async () => {
    const props = {
      protectionEnabled: false,
      clusterID: 'fake-cluster',
      canToggle: true,
    };
    const { user } = render(<DeleteProtection {...props} />);
    await user.click(screen.getByRole('button'));
    expect(openModal).toHaveBeenCalledWith(modals.DELETE_PROTECTION, {
      clusterID: 'fake-cluster',
      protectionEnabled: false,
    });
  });
});
