import React from 'react';

import { useFetchUpgradeGateAgreements } from '~/queries/ClusterDetailsQueries/useFetchUpgradeGateAgreements';
import { checkAccessibility, render, screen } from '~/testUtils';
import { VersionGate, VersionGateAgreement } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

import UpgradeAcknowledgeWarning from '../UpgradeAcknowledgeWarning/UpgradeAcknowledgeWarning';

// Mock the useFetchUpgradeGateAgreements hook
jest.mock('~/queries/ClusterDetailsQueries/useFetchUpgradeGateAgreements', () => ({
  useFetchUpgradeGateAgreements: jest.fn(),
}));

const mockUseFetchUpgradeGateAgreements = useFetchUpgradeGateAgreements as jest.Mock;

interface UpgradeAcknowledgeWarningProps {
  isPlain?: boolean;
  showConfirm?: boolean;
  isInfo?: boolean;
  isStsEnabled?: boolean;
  isHypershift?: boolean;
  schedules: UpgradePolicyWithState[];
  upgradeGates: VersionGate[];
  cluster: AugmentedCluster;
  showUpgradeWarning?: boolean;
  isMinorVersionUpgradesEnabled?: boolean;
}

describe('<UpgradeAcknowledgeWarning>', () => {
  const openModal = jest.fn();

  // Set up default mock implementation
  beforeEach(() => {
    mockUseFetchUpgradeGateAgreements.mockReturnValue({
      isLoading: false,
      data: {
        data: {
          items: [
            {
              id: 'mock-agreement-1',
              version_gate: {
                id: '1',
                kind: 'VersionGate',
                version_raw_id_prefix: '4.4',
                sts_only: false,
              },
            },
          ],
        },
      } as any,
    });
  });

  const defaultCluster: AugmentedCluster = {
    id: 'myClusterId',
    openshift_version: 'my.openshift.version',
    version: {
      raw_id: '4.2.10',
      available_upgrades: ['4.4.10'],
    },
    subscription: {
      id: 'mock-subscription-id',
      status: 'Active',
      managed: true,
      rh_region_id: 'us-east-1',
    },
    upgradeGates: [
      {
        version_gate: {
          id: '1',
          kind: 'VersionGate',
          version_raw_id_prefix: '4.4',
          sts_only: false,
        },
      },
      {
        version_gate: {
          id: '2',
          kind: 'VersionGate',
          version_raw_id_prefix: '4.2',
          sts_only: false,
        },
      },
      {
        version_gate: {
          id: '3',
          kind: 'VersionGate',
          version_raw_id_prefix: '4.5',
          sts_only: false,
        },
      },
      {
        version_gate: {
          id: '4',
          kind: 'VersionGate',
          version_raw_id_prefix: '5.10',
          sts_only: false,
        },
      },
    ] as VersionGateAgreement[],
  } as AugmentedCluster;

  const defaultSchedules: UpgradePolicyWithState[] = [
    {
      upgrade_type: 'OSD',
      schedule_type: 'automatic',
      state: { value: 'started' },
    },
  ];

  const defaultUpgradeGates: VersionGate[] = [
    {
      kind: 'VersionGate',
      id: '1',
      version_raw_id_prefix: '4.4',
      label: 'upgrade-to-4.4',
      value: '4.4',
      sts_only: false,
    },
    {
      kind: 'VersionGate',
      id: '2',
      version_raw_id_prefix: '4.2',
      label: 'upgrade-to-4.2',
      value: '4.2',
      sts_only: false,
    },
    {
      kind: 'VersionGate',
      id: '3',
      version_raw_id_prefix: '4.5',
      label: 'upgrade-to-4.5',
      value: '4.5',
      sts_only: false,
    },
    {
      kind: 'VersionGate',
      id: '4',
      version_raw_id_prefix: '5.9',
      label: 'upgrade-to-5.9',
      value: '5.9',
      sts_only: true,
    },
  ];

  const defaultProps: UpgradeAcknowledgeWarningProps = {
    isStsEnabled: false,
    isHypershift: false,
    cluster: defaultCluster,
    schedules: defaultSchedules,
    upgradeGates: defaultUpgradeGates,
  };

  afterEach(() => {
    openModal.mockClear();
  });

  it('Displays nothing if cluster id is unknown', () => {
    const newProps: UpgradeAcknowledgeWarningProps = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        id: undefined,
      } as AugmentedCluster,
    };
    const { container } = render(<UpgradeAcknowledgeWarning {...newProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('Displays nothing if openshiftVersion is unknown', () => {
    const newProps: UpgradeAcknowledgeWarningProps = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        openshift_version: undefined,
      } as AugmentedCluster,
    };
    const { container } = render(<UpgradeAcknowledgeWarning {...newProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('Display nothing if no clusterUnmetAcks AND do not show confirm', () => {
    const { container } = render(<UpgradeAcknowledgeWarning {...defaultProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('Display confirmation if clusterMetAcks and is yStream approved', async () => {
    const newProps: UpgradeAcknowledgeWarningProps = {
      ...defaultProps,
      showConfirm: true,
      isMinorVersionUpgradesEnabled: true,
    };

    const { container } = render(<UpgradeAcknowledgeWarning {...newProps} />);

    expect(screen.getByText('Administrator acknowledgement was received.')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('Display confirmation if there is only clusterMetAcks and is not yStream approved', () => {
    const newProps: UpgradeAcknowledgeWarningProps = {
      ...defaultProps,
      showConfirm: true,
    };

    render(<UpgradeAcknowledgeWarning {...newProps} />);

    expect(screen.getByText('Administrator acknowledgement was received.')).toBeInTheDocument();
  });

  it('Display alert if individual update is required', () => {
    const testCluster: AugmentedCluster = {
      id: 'muClusterId2',
      openshift_version: 'my.openshift.version',
      version: {
        raw_id: '4.2.10',
        available_upgrades: ['4.4.10'],
      },
      subscription: {
        id: 'mock-subscription-id',
        status: 'Active',
        managed: true,
        rh_region_id: 'us-east-1',
      },
      upgradeGates: [{ version_gate: { id: 'oldGate' } as VersionGate }] as VersionGateAgreement[],
    } as AugmentedCluster;

    const testSchedules: UpgradePolicyWithState[] = [
      {
        id: 'myUpgradePolicyID',
        version: '4.4.10',
        schedule_type: 'automatic',
        state: { value: 'pending' },
        enable_minor_version_upgrades: false,
      } as UpgradePolicyWithState,
    ];

    const testUpgradeGates: VersionGate[] = [
      {
        kind: 'VersionGate',
        id: '1',
        version_raw_id_prefix: '4.2',
        label: 'upgrade-to-4.2',
        value: '4.2',
        sts_only: false,
      },
    ];

    const newProps: UpgradeAcknowledgeWarningProps = {
      ...defaultProps,
      cluster: testCluster,
      schedules: testSchedules,
      upgradeGates: testUpgradeGates,
      isInfo: true,
    };

    const { container } = render(<UpgradeAcknowledgeWarning showUpgradeWarning {...newProps} />);
    console.log(container.innerHTML);
    expect(
      screen.getByText(
        'Your update strategy is currently set to recurring updates. Update 4.4.10 is a Y stream update and must be individually updated.',
      ),
    ).toBeInTheDocument();
  });
});
