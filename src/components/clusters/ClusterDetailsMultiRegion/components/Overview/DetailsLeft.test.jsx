/* eslint-disable camelcase */
import React from 'react';

import {
  ALLOW_EUS_CHANNEL,
  FIPS_FOR_HYPERSHIFT,
  OSD_GCP_WIF,
} from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen, within } from '~/testUtils';

import fixtures from '../../__tests__/ClusterDetails.fixtures';

import DetailsLeft from './DetailsLeft';

const defaultProps = {
  cluster: fixtures.clusterDetails.cluster,
  cloudProviders: fixtures.cloudProviders,
  showAssistedId: false,
  wifConfigData: {
    isLoading: false,
    isSuccess: false,
    displayName: null,
  },
};

const componentText = {
  CONTROL_PLANE: {
    label: 'Control plane type',
    hosted: 'Hosted architecture',
    classic: 'Classic architecture',
  },
  AVAILABILITY: { label: 'Availability', multi: 'Multi-zone', single: 'Single zone', NA: 'N/A' },
  REGION: { label: 'Region', NA: 'N/A' },
  PROVIDER: { label: 'Provider', NA: 'N/A' },
  AUTHENTICATION_TYPE: { label: 'Authentication type' },
  WIF_CONFIGURATION: { label: 'WIF configuration' },
  ID: { label: 'Cluster ID', aiLabel: 'Assisted cluster ID / Cluster ID', NA: 'N/A' },
  DOMAIN_PREFIX: {
    label: 'Domain prefix',
  },
  VERSION: { label: 'Version' },
  CHANNEL_GROUP: { label: 'Channel group', stable: 'Stable', unavailable: 'N/A' },
  OWNER: { label: 'Owner', NA: 'N/A' },
  SUBSCRIPTION: { label: 'Subscription billing model' },
  INFRASTRUCTURE: { label: 'Infrastructure billing model' },
  ENCRYPT_WITH_CUSTOM_KEYS: {
    label: 'Encrypt volumes with custom keys',
  },
  CUSTOM_KMS_KEY: {
    label: 'Custom KMS key ARN',
  },
  FIPS: {
    label: 'Encryption level',
    value: 'FIPS Cryptography enabled',
  },
};
jest.mock('./SupportStatusLabel');

const checkForValue = (label, value) => {
  expect(screen.getByText(label)).toBeInTheDocument();
  if (value) {
    // Verify that the value is below the label
    // Cannot use roles of "term" and "definition" because there are children elements
    const labelObj = screen.getByText(label);
    expect(labelObj.closest('div').querySelector('dd')).toHaveTextContent(value);
  }
};

const checkForValueAbsence = (label, value) => {
  expect(screen.queryByText(label)).not.toBeInTheDocument();
  if (value) {
    expect(screen.queryByText(value)).not.toBeInTheDocument();
  }
};

const checkIfRendered = async () =>
  expect(await screen.findByText('OpenShift:')).toBeInTheDocument();

describe('<DetailsLeft />', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('is accessible', async () => {
    // Arrange
    const OSDClusterFixture = fixtures.clusterDetails.cluster;

    const props = { ...defaultProps, cluster: OSDClusterFixture };
    const { container } = render(<DetailsLeft {...props} />);
    await checkIfRendered();

    // Assert
    await checkAccessibility(container);
  });

  describe('Cluster id', () => {
    it('shows cluster ID for a non assisted installer cluster', async () => {
      // Arrange
      const OSDClusterFixture = fixtures.clusterDetails.cluster;

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.ID.label, 'bae5b227-2472-4e71-be4d-a18fc60bb48a');
    });

    it('shows assisted installer id for assisted installer cluster', async () => {
      // Arrange
      const AIClusterFixture = fixtures.AIClusterDetails.cluster;

      const props = { ...defaultProps, cluster: AIClusterFixture, showAssistedId: true };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(
        componentText.ID.aiLabel,
        '1i4counta3holamvo1g5tp6n8p3a03bq / bae5b227-2472-4e71-be4d-a18fc60bb48a',
      );
    });

    it('shows "NA" when cluster id is not known', async () => {
      // Arrange
      const OSDClusterFixture = { ...fixtures.clusterDetails.cluster, external_id: undefined };

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.ID.label, componentText.ID.NA);
    });

    it('shows "NA" when id is not know for an assisted installer cluster', async () => {
      // Arrange
      const AIClusterFixture = { ...fixtures.AIClusterDetails.cluster, aiCluster: {} };

      const props = { ...defaultProps, cluster: AIClusterFixture, showAssistedId: true };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(
        componentText.ID.aiLabel,
        `${componentText.ID.NA} / bae5b227-2472-4e71-be4d-a18fc60bb48a`,
      );
    });
  });

  describe('Domain prefix', () => {
    it('shows the label and value when feature gate is enabled', async () => {
      // Arrange
      const OSDClusterFixture = fixtures.clusterDetails.cluster;
      const domainPrefix = 'prefix-value-1';
      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.DOMAIN_PREFIX.label, domainPrefix);
    });

    it('hides the label and value when feature gate is enabled but the value is not set', async () => {
      // Arrange
      const OSDClusterFixture = { ...fixtures.clusterDetails.cluster, domain_prefix: '' };
      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      expect(screen.queryByText(componentText.DOMAIN_PREFIX.label)).toBe(null);
    });
  });

  describe('Control plane', () => {
    it('shows control plane type as Hosted architecture if hypershift', async () => {
      // Arrange
      const ROSAHypershiftClusterFixture = fixtures.ROSAHypershiftClusterDetails.cluster;
      expect(ROSAHypershiftClusterFixture.hypershift.enabled).toBeTruthy();

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.CONTROL_PLANE.label, componentText.CONTROL_PLANE.hosted);
    });

    it('hides control plane type if OSD', async () => {
      // Arrange
      const OSDClusterFixture = fixtures.clusterDetails.cluster;
      expect(OSDClusterFixture.hypershift?.enabled).toBeFalsy();

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.CONTROL_PLANE.label, componentText.CONTROL_PLANE.hosted);
    });

    it('shows control plane type as Classic architecture if ROSA Classic', async () => {
      // Arrange
      const ROSAClusterFixture = fixtures.ROSAClusterDetails.cluster;
      expect(ROSAClusterFixture.hypershift?.enabled).toBeFalsy();

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.CONTROL_PLANE.label, componentText.CONTROL_PLANE.classic);
    });
  });

  describe('Region', () => {
    it('show region', async () => {
      // Arrange
      const OSDClusterFixture = fixtures.clusterDetails.cluster;

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.REGION.label, 'us-east-1');
    });

    it('show "N/A" for region, if region is not set', async () => {
      // Arrange
      const OSDClusterNoRegionFixture = { ...fixtures.clusterDetails.cluster, region: {} };

      const props = { ...defaultProps, cluster: OSDClusterNoRegionFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.REGION.label, componentText.REGION.NA);
    });

    describe('in RHOIC cluster', () => {
      it('shows region if known', async () => {
        const OSDClusterFixture = fixtures.clusterDetails.cluster;

        const fakedRHOICCluster = {
          ...OSDClusterFixture,
          region: { id: 'us-east' },
          subscription: { plan: { type: 'RHOIC' } },
        };

        const props = { ...defaultProps, cluster: fakedRHOICCluster };

        render(<DetailsLeft {...props} />);
        await checkIfRendered();

        checkForValue(componentText.REGION.label, 'us-east');
      });

      it('hides region label if region is not known', async () => {
        const OSDClusterFixture = fixtures.clusterDetails.cluster;

        const fakedRHOICCluster = {
          ...OSDClusterFixture,
          region: {},
          subscription: { plan: { type: 'RHOIC' } },
        };

        const props = { ...defaultProps, cluster: fakedRHOICCluster };

        render(<DetailsLeft {...props} />);
        await checkIfRendered();

        checkForValueAbsence(componentText.REGION.label);
      });
    });
  });

  describe('Cloud provider', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('show "NA" if cluster does not have a cloud provider id', async () => {
      // Arrange
      const NoProviderClusterFixture = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: undefined,
      };

      const props = { ...defaultProps, cluster: NoProviderClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.PROVIDER.label, componentText.PROVIDER.NA);
    });

    it('shows cloud provider id as uppercase if cloud providers has not loaded', async () => {
      // Arrange
      const ClusterFixture = {
        ...fixtures.clusterDetails.cluster,
      };

      expect(ClusterFixture.cloud_provider.id).toEqual('aws');

      const props = {
        ...defaultProps,
        cluster: ClusterFixture,
        cloudProviders: { ...fixtures.cloudProviders, fulfilled: false },
      };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.PROVIDER.label, 'AWS');
    });

    it('shows cloud provider id as uppercase if cloud provider is not known by the application', async () => {
      // Arrange
      const ClusterFixture = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: { id: 'mynewprovider' },
      };

      expect(fixtures.cloudProviders.mynewprovider).toBeUndefined();

      const props = {
        ...defaultProps,
        cluster: ClusterFixture,
      };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.PROVIDER.label, 'MYNEWPROVIDER');
    });

    it('shows NA if the cloud provider is known but does not have a display name', async () => {
      // Arrange
      const ClusterFixture = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: { kind: 'CloudProvider', id: 'rain' },
      };

      const ProviderFixture = { ...fixtures.cloudProviders };
      ProviderFixture.rain = { kind: 'CloudProvider', id: 'rain' };

      const props = {
        ...defaultProps,
        cluster: ClusterFixture,
        cloudProviders: ProviderFixture,
      };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.PROVIDER.label, componentText.PROVIDER.NA);
    });

    it('hides cloud provider if a ROSA cluster', async () => {
      // Arrange
      const ROSAClusterFixture = fixtures.ROSAClusterDetails.cluster;

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.PROVIDER.label);
    });

    it('hides cloud provider if ROSA Hypershift', async () => {
      // Arrange
      const ROSAHypershiftClusterFixture = fixtures.ROSAHypershiftClusterDetails.cluster;

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.PROVIDER.label);
    });
  });

  describe('Authentication type', () => {
    it('is not present when the WIF feature flag is off', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, false]]);
      const cluster = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: {
          id: 'gcp',
        },
        ccs: { enabled: true },
        gcp: {},
      };

      const props = {
        ...defaultProps,
        cluster,
      };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.AUTHENTICATION_TYPE.label);
    });

    it('shows "Workload Identity Federation" for OSD GCP clusters with a WIF config', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const cluster = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: {
          id: 'gcp',
        },
        ccs: { enabled: true },
        gcp: {
          authentication: {
            href: '/api/clusters_mgmt/v1/gcp/wif_configs/123456789123456789',
            id: '123456789123456789',
            kind: 'WifConfig',
          },
        },
      };

      const props = { ...defaultProps, cluster };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.AUTHENTICATION_TYPE.label, 'Workload Identity Federation');
    });

    it('shows "Service Account" for OSD GCP clusters without a WIF config', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const cluster = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: {
          id: 'gcp',
        },
        ccs: { enabled: true },
        gcp: {},
      };

      const props = {
        ...defaultProps,
        cluster,
      };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.AUTHENTICATION_TYPE.label, 'Service Account');
    });

    it.each([
      [
        'OSD AWS cluster',
        {
          ...fixtures.clusterDetails.cluster,
          cloud_provider: 'aws',
          ccs: { enabled: true },
        },
      ],
      [
        'OSD non-ccs cluster',
        {
          ...fixtures.clusterDetails.cluster,
          cloud_provider: 'aws',
        },
      ],
      ['ROSA cluster', fixtures.ROSAClusterDetails.cluster],
      ['ROSA HyperShift cluster', fixtures.ROSAHypershiftClusterDetails.cluster],
    ])('is not shown for a %s', async (_name, cluster) => {
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const props = { ...defaultProps, cluster };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.AUTHENTICATION_TYPE.label);
    });
  });

  describe('GCP WIF Configuration', () => {
    const cluster = {
      ...fixtures.clusterDetails.cluster,
      cloud_provider: {
        id: 'gcp',
      },
      ccs: { enabled: true },
      gcp: {
        authentication: {
          href: '/api/clusters_mgmt/v1/gcp/wif_configs/123456789123456789',
          id: '123456789123456789',
          kind: 'WifConfig',
        },
      },
    };

    it('shows the WIF name when a WIF configuration is present', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const wifConfigName = 'some-wif-config';
      const wifConfigData = {
        isLoading: false,
        isSuccess: true,
        displayName: wifConfigName,
      };

      const props = { ...defaultProps, cluster, wifConfigData };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.WIF_CONFIGURATION.label, wifConfigName);
    });

    it('does not show the WIF name when a WIF configuration is absent', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const cluster = {
        ...fixtures.clusterDetails.cluster,
        cloud_provider: {
          id: 'gcp',
        },
        ccs: { enabled: true },
        gcp: {},
      };

      const props = { ...defaultProps, cluster };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.WIF_CONFIGURATION.label);
    });

    it('shows N/A when a WIF config cannot be retrieved', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);

      const wifConfigData = {
        isLoading: false,
        isSuccess: false,
        displayName: null,
      };
      const props = { ...defaultProps, cluster, wifConfigData };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.WIF_CONFIGURATION.label, 'N/A');
    });

    it('shows a skeleton while fetching the WIF config info', async () => {
      // Arrange
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);

      const wifConfigData = {
        isLoading: true,
        isSuccess: false,
        displayName: null,
      };
      const props = { ...defaultProps, cluster, wifConfigData };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      expect(screen.getByText('Loading WIF configuration')).toBeInTheDocument();
    });
  });

  describe('Availability', () => {
    it('hides availability if not managed', async () => {
      // Arrange
      const ROSAClusterFixture = { ...fixtures.ROSAClusterDetails.cluster, managed: false };

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.AVAILABILITY.label);
    });

    it('shows availability as "Multi-zone" if multi-zone cluster that is not hypershift', async () => {
      // Arrange
      const ROSAClusterFixture = {
        ...fixtures.ROSAClusterDetails.cluster,
        managed: true,
        multi_az: true,
      };
      expect(ROSAClusterFixture.hypershift?.enabled).toBeFalsy();

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.AVAILABILITY.label, componentText.AVAILABILITY.multi);
    });

    it('shows availability as "Single zone" if non-multi-zone cluster that is not hypershift', async () => {
      // Arrange
      const ROSAClusterFixture = {
        ...fixtures.ROSAClusterDetails.cluster,
        managed: true,
        multi_az: false,
      };
      expect(ROSAClusterFixture.hypershift?.enabled).toBeFalsy();

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.AVAILABILITY.label, componentText.AVAILABILITY.single);
    });

    it('shows Multi-Zone for Hypershift cluster ', async () => {
      // NOTE: This tests that the UI shows multi-zone regardless of value

      // Arrange
      const ROSAHypershiftClusterFixture = {
        ...fixtures.ROSAHypershiftClusterDetails.cluster,
        multi_az: true,
      };
      expect(ROSAHypershiftClusterFixture.hypershift.enabled).toBeTruthy();
      expect(ROSAHypershiftClusterFixture.multi_az).toBe(true);

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.AVAILABILITY.label, componentText.AVAILABILITY.multi);
    });

    it('shows N/A for managed archived clusters', async () => {
      // Arrange
      const { multi_az, ...archivedCluster } = fixtures.ROSAHypershiftClusterDetails.cluster;
      const ROSAHypershiftClusterFixture = { ...archivedCluster, state: '' };

      expect(ROSAHypershiftClusterFixture.multi_az).toBeUndefined();

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.AVAILABILITY.label, componentText.AVAILABILITY.NA);
    });
  });

  describe('Version popover', () => {
    it('shows version popover hint for Hypershift', async () => {
      // Arrange
      const ROSAHypershiftClusterFixture = fixtures.ROSAHypershiftClusterDetails.cluster;
      expect(ROSAHypershiftClusterFixture.hypershift.enabled).toBeTruthy();

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      expect(
        within(screen.getByText(componentText.VERSION.label)).getByRole('button', {
          name: 'More information',
        }),
      ).toBeInTheDocument();
    });

    it('hides version popover hint for non-hypershift', async () => {
      // Arrange
      const OSDClusterFixture = fixtures.clusterDetails.cluster;
      expect(OSDClusterFixture.hypershift?.enabled).toBeFalsy();

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      expect(
        within(screen.getByText(componentText.VERSION.label)).queryByRole('button', {
          name: 'More information',
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Custom encryption keys', () => {
    it('shows KMS key ARN if present', async () => {
      // Arrange
      const keyARN = 'arn:aws:kms:us-east-1:000000000006:key/98a8df03-1d14-4eb5-84dc-82a3f490dfa9';
      const cluster = { ...fixtures.ROSAManualClusterDetails.cluster };
      const ROSAClusterFixture = {
        ...cluster,
        aws: {
          ...cluster.aws,
          kms_key_arn: keyARN,
        },
      };

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.CUSTOM_KMS_KEY.label, keyARN);
      checkForValue(componentText.ENCRYPT_WITH_CUSTOM_KEYS.label, 'Enabled');
    });

    it('hides KMS key ARN if not present', async () => {
      // Arrange
      const ROSAClusterFixture = {
        ...fixtures.ROSAManualClusterDetails.cluster,
      };

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.CUSTOM_KMS_KEY.label);
      checkForValueAbsence(componentText.ENCRYPT_WITH_CUSTOM_KEYS.label);
    });
  });

  describe('Subscription and infrastructure headings', () => {
    it('shows subscription type and infrastructure headings if managed and not ROSA', async () => {
      // Arrange
      const OSDClusterFixture = {
        ...fixtures.clusterDetails.cluster,
        managed: true,
      };

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.SUBSCRIPTION.label);
      checkForValue(componentText.INFRASTRUCTURE.label);
    });

    it('hides subscription type and infrastructure headings if not managed', async () => {
      // Arrange
      const OSDClusterFixture = {
        ...fixtures.clusterDetails.cluster,
        managed: false,
      };

      const props = { ...defaultProps, cluster: OSDClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.SUBSCRIPTION.label);
      checkForValueAbsence(componentText.INFRASTRUCTURE.label);
    });

    it('hides subscription type and infrastructure headings if ROSA', async () => {
      // Arrange
      const ROSAClusterFixture = fixtures.ROSAClusterDetails.cluster;

      const props = { ...defaultProps, cluster: ROSAClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.SUBSCRIPTION.label);
      checkForValueAbsence(componentText.INFRASTRUCTURE.label);
    });

    it('hides subscription type and infrastructure headings if Hypershift', async () => {
      // Arrange
      const ROSAHypershiftClusterFixture = fixtures.ROSAHypershiftClusterDetails.cluster;

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.SUBSCRIPTION.label);
      checkForValueAbsence(componentText.INFRASTRUCTURE.label);
    });
  });

  describe('Channel group HCP cluster', () => {
    it('Shows channel group if available', async () => {
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
      const ROSAHypershiftClusterFixture = fixtures.ROSAHypershiftClusterDetails.cluster;
      expect(ROSAHypershiftClusterFixture.hypershift.enabled).toBeTruthy();

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.CHANNEL_GROUP.label, componentText.CHANNEL_GROUP.stable);
    });

    it('Shows N/A if channel group is unavailable', async () => {
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
      const ROSAHypershiftClusterFixture = {
        ...fixtures.ROSAHypershiftClusterDetails.cluster,
        version: {
          channel_group: 'N/A',
        },
      };
      expect(ROSAHypershiftClusterFixture.hypershift.enabled).toBeTruthy();

      const props = { ...defaultProps, cluster: ROSAHypershiftClusterFixture };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.CHANNEL_GROUP.label, componentText.CHANNEL_GROUP.unavailable);
    });
  });

  describe('FIPS field', () => {
    it('is not shown by default', async () => {
      render(<DetailsLeft {...defaultProps} />);
      await checkIfRendered();

      // Assert
      checkForValueAbsence(componentText.FIPS.label);
    });

    it('is shown if FIPS is enabled', async () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          fips: true,
        },
      };
      render(<DetailsLeft {...props} />);
      await checkIfRendered();

      // Assert
      checkForValue(componentText.FIPS.label, componentText.FIPS.value);
    });

    describe('in ROSA HCP', () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...fixtures.ROSAHypershiftClusterDetails.cluster,
          fips: true,
        },
      };

      it('is not shown by default, even when FIPS is enabled', async () => {
        render(<DetailsLeft {...props} />);
        await checkIfRendered();

        // Assert
        checkForValueAbsence(componentText.FIPS.label);
      });

      it('is shown in ROSA HCP when feature-gate is on, when FIPS is enabled', async () => {
        mockUseFeatureGate([[FIPS_FOR_HYPERSHIFT, true]]);

        render(<DetailsLeft {...props} />);
        await checkIfRendered();

        // Assert
        checkForValue(componentText.FIPS.label, componentText.FIPS.value);
      });

      it('is not shown in ROSA HCP when feature-gate is off, even when FIPS is enabled', async () => {
        mockUseFeatureGate([[FIPS_FOR_HYPERSHIFT, false]]);

        render(<DetailsLeft {...props} />);
        await checkIfRendered();

        // Assert
        checkForValueAbsence(componentText.FIPS.label);
      });
    });
  });
});
