import React from 'react';
import * as reactRedux from 'react-redux';

import apiRequest from '~/services/apiRequest';
import { act, render, screen, userEvent } from '~/testUtils';
import { AugmentedCluster } from '~/types/types';

import MinorVersionUpgradeAlert from '../MinorVersionUpgradeAlert';
import {
  getEnableMinorVersionUpgrades,
  isNextMinorVersionAvailableHelper,
} from '../MinorVersionUpgradeAlertHelpers';

const enableLinkText = 'Allow the next minor version update';
const disableLinkText = 'Disallow this minor version update';

const enableTitleForKnownMinor = 'New minor version available';
const disableTitleForKnownMinor = 'Next minor version update allowed';

jest.mock('../../UpgradeAcknowledge/UpgradeAcknowledgeHelpers');
jest.mock('../MinorVersionUpgradeAlertHelpers');

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.useFakeTimers({
  legacyFakeTimers: true, // TODO 'modern'
});

// Type the mocked functions
const mockGetEnableMinorVersionUpgrades = getEnableMinorVersionUpgrades as jest.Mock;
const mockIsNextMinorVersionAvailableHelper = isNextMinorVersionAvailableHelper as jest.Mock;

describe('<MinorVersionUpgradeAlert >', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const dispatchMock = jest.fn();
  useDispatchMock.mockReturnValue(dispatchMock);

  const defaultProps = {
    clusterId: 'myClusterId',
    isHypershift: false,
    cluster: {
      version: { raw_id: '1.2.3', available_upgrades: ['1.2.4', '1.2.5'] },
    } as AugmentedCluster,
    schedules: [
      {
        id: 'myUpgradePolicyId',
        schedule_type: 'automatic' as const,
        enable_minor_version_upgrades: false,
        version: '1.2.4',
      },
    ],
    upgradeGates: undefined,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Alert is not shown if is not automatic', () => {
    const newProps = {
      ...defaultProps,
    };
    const { container } = render(<MinorVersionUpgradeAlert {...newProps} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Alert is not shown if has unacknowledged upgrade gates', () => {
    const newProps = {
      ...defaultProps,
    };
    const { container } = render(<MinorVersionUpgradeAlert {...newProps} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Alert is not shown if upgrade policy is unknown', () => {
    const newProps = {
      ...defaultProps,
      schedules: [],
    };
    const { container } = render(<MinorVersionUpgradeAlert {...newProps} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Alert is not shown if clusterId is not known', () => {
    const newProps = {
      ...defaultProps,
      clusterId: '',
    };
    const { container } = render(<MinorVersionUpgradeAlert {...newProps} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Alert is not shown when minor upgrade is not available', () => {
    const newProps = {
      ...defaultProps,
      cluster: {
        version: {
          raw_id: '1.2.3',
          available_upgrades: [],
        },
      } as any,
    };
    const { container } = render(<MinorVersionUpgradeAlert {...newProps} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Alert is not shown for STS cluster', () => {
    const newProps = {
      ...defaultProps,
      cluster: {
        aws: {
          sts: {
            enabled: true,
          },
        },
      } as any,
    };
    const { container } = render(<MinorVersionUpgradeAlert {...newProps} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Correct data is shown for unapproved minor upgrade when minor upgrade is available', async () => {
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);
    const newProps = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        aws: {
          sts: {
            enabled: false,
          },
        },
      } as any,
    };
    render(<MinorVersionUpgradeAlert {...newProps} />);
    expect(await screen.findByText(enableTitleForKnownMinor)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: enableLinkText })).toBeInTheDocument();
  });

  it('Correct data is shown for approved minor upgrade when minor upgrade is available', async () => {
    mockGetEnableMinorVersionUpgrades.mockReturnValue(true);
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);
    const newProps = {
      ...defaultProps,
    };
    render(<MinorVersionUpgradeAlert {...newProps} />);
    expect(await screen.findByText(disableTitleForKnownMinor)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: disableLinkText })).toBeInTheDocument();
  });

  it('API call is made when user clicks on enable', async () => {
    const apiReturnValue = { data: { enable_minor_version_upgrades: true } };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);

    const newProps = {
      ...defaultProps,
    };
    mockGetEnableMinorVersionUpgrades.mockReturnValue(false);
    const { user } = render(<MinorVersionUpgradeAlert {...newProps} />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: enableLinkText }));
      await new Promise(process.nextTick); // wait for all promises to finish
      jest.runAllTimers();
    });

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      payload: apiReturnValue.data,
      type: 'SET_CLUSTER_UPGRADE_POLICY',
    });
    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });

  it('API call is made when user clicks on disable', async () => {
    const apiReturnValue = { data: { enable_minor_version_upgrades: false } };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);
    mockGetEnableMinorVersionUpgrades.mockReturnValue(true);
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);

    const newProps = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        version: { raw_id: '1.2.3', available_upgrades: [] },
        aws: {
          sts: {
            enabled: false,
          },
        },
      } as any,
      schedules: [
        {
          id: 'myUpgradePolicyId',
          schedule_type: 'automatic' as const,
          enable_minor_version_upgrades: true,
          version: '1.2.4',
        },
      ],
    };
    const { user } = render(<MinorVersionUpgradeAlert {...newProps} />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: disableLinkText }));
      await new Promise(process.nextTick); // wait for all promises to finish
      jest.runAllTimers();
    });

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: false },
    );
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      payload: apiReturnValue.data,
      type: 'SET_CLUSTER_UPGRADE_POLICY',
    });

    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });

  it('Error is shown if patch API call fails', async () => {
    const patchError = {
      response: {
        data: { reason: 'an error happened' },
      },
    };
    (apiRequest.patch as jest.Mock).mockRejectedValue(patchError);
    mockGetEnableMinorVersionUpgrades.mockReturnValue(true);
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);
    const newProps = {
      ...defaultProps,
    };
    const { user } = render(<MinorVersionUpgradeAlert {...newProps} />);

    await user.click(screen.getByRole('button', { name: disableLinkText }));
    await new Promise(process.nextTick); // wait for all promises to finish
    jest.runAllTimers();

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: false },
    );
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('alert-success')).toBeInTheDocument();
  });

  it('(HCP) API call is made when user clicks on enable with hosted control plane cluster', async () => {
    const apiReturnValue = { data: { enable_minor_version_upgrades: true } };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);
    mockGetEnableMinorVersionUpgrades.mockReturnValue(false);
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);
    const newProps = {
      ...defaultProps,
      isHypershift: true,
      cluster: {
        ...defaultProps.cluster,
        hypershift: {
          enabled: true,
        },
      } as any,
    };
    render(<MinorVersionUpgradeAlert {...newProps} />);

    const user = userEvent.setup({
      delay: null,
    });
    await act(async () => {
      await user.click(screen.getByRole('button', { name: enableLinkText }));
      await new Promise(process.nextTick); // wait for all promises to finish
      jest.runAllTimers();
    });

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/control_plane/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      payload: apiReturnValue.data,
      type: 'SET_CLUSTER_UPGRADE_POLICY',
    });
    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });

  it('(HCP) API call is made when user clicks on disable with hosted control plane cluster', async () => {
    const apiReturnValue = { data: { enable_minor_version_upgrades: false } };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);
    mockGetEnableMinorVersionUpgrades.mockReturnValue(true);
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);
    const newProps = {
      ...defaultProps,
      isHypershift: true,
      cluster: {
        ...defaultProps.cluster,
        hypershift: {
          enabled: true,
        },
      } as any,
    };
    const { user } = render(<MinorVersionUpgradeAlert {...newProps} />);
    await act(async () => {
      await user.click(screen.getByRole('button', { name: disableLinkText }));
      await new Promise(process.nextTick); // wait for all promises to finish
      jest.runAllTimers();
    });

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/control_plane/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: false },
    );
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      payload: apiReturnValue.data,
      type: 'SET_CLUSTER_UPGRADE_POLICY',
    });

    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });

  it('(HCP) Error is shown if patch API call fails with hosted control plane cluster', async () => {
    const patchError = {
      response: {
        data: { reason: 'an error happened' },
      },
    };
    (apiRequest.patch as jest.Mock).mockRejectedValue(patchError);
    mockGetEnableMinorVersionUpgrades.mockReturnValue(true);
    mockIsNextMinorVersionAvailableHelper.mockReturnValue(true);
    const newProps = {
      ...defaultProps,
      isHypershift: true,
      cluster: {
        hypershift: {
          enabled: true,
        },
      } as any,
    };
    render(<MinorVersionUpgradeAlert {...newProps} />);
    const user = userEvent.setup({
      delay: null,
    });
    await user.click(screen.getByRole('button', { name: disableLinkText }));
    await new Promise(process.nextTick); // wait for all promises to finish
    jest.runAllTimers();

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/control_plane/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: false },
    );
    expect(dispatchMock).not.toHaveBeenCalled();
  });
});
