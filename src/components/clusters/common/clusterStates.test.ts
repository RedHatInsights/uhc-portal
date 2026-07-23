import { normalizedProducts } from '~/common/subscriptionTypes';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';
import { Cluster } from '~/types/clusters_mgmt.v1';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

import {
  defaultClusterFromSubscription,
  defaultMetric,
  defaultSubscription,
} from './__tests__/clusterStates.fixtures';
import clusterStates, {
  getClusterStateAndDescription,
  getInflightChecks,
  isAWS,
  isAWSPrivateCluster,
  isCCS,
  isClusterUpgradeCompleted,
  isClusterUpgrading,
  isGCP,
  isHibernating,
  isHypershiftCluster,
  isOffline,
  isOSD,
  isOSDGCPWaitingForRolesOnHostProject,
  isROSA,
  isWaitingForOIDCProviderOrOperatorRolesMode,
  isWaitingHypershiftCluster,
  isWaitingROSAManualMode,
  isWIFCluster,
} from './clusterStates';

describe('getClusterStateAndDescription', () => {
  it('should not handle AssistedInstall states', () => {
    const cluster: ClusterFromSubscription = {
      ...defaultClusterFromSubscription,
      subscription: {
        ...defaultSubscription,
        plan: {
          id: normalizedProducts.OCP_AssistedInstall,
          type: 'OCP',
        },
        status: SubscriptionCommonFieldsStatus.Disconnected,
      },
    };
    const result = getClusterStateAndDescription(cluster);
    expect(result.description).toEqual('Disconnected');
  });

  it('should show OCP updating', () => {
    const cluster: ClusterFromSubscription = {
      ...defaultClusterFromSubscription,
      metrics: {
        ...defaultMetric,
        upgrade: {
          state: 'running',
        },
      },
    };

    const result = getClusterStateAndDescription(cluster);
    expect(result.description).toEqual('Updating');
  });

  it.each([
    [{ subStatus: SubscriptionCommonFieldsStatus.Active }, 'Ready'],
    [{ subStatus: SubscriptionCommonFieldsStatus.Stale }, 'Stale'],
    [{ subStatus: SubscriptionCommonFieldsStatus.Archived }, 'Archived'],
    [{ subStatus: SubscriptionCommonFieldsStatus.Deprovisioned }, 'Deleted'],
    [{ subStatus: SubscriptionCommonFieldsStatus.Disconnected }, 'Disconnected'],
    [{ subStatus: SubscriptionCommonFieldsStatus.Stale }, 'Stale'],
    [{ state: clusterStates.waiting }, 'Waiting'],
    [{ state: clusterStates.installing }, 'Installing'],
    [{ state: 'validating' }, 'Installing'],
    [{ state: clusterStates.validating }, 'Installing'],
    [{ state: clusterStates.pending }, 'Installing'],
    [{ state: clusterStates.ready }, 'Ready'],
    [{ state: clusterStates.uninstalling }, 'Uninstalling'],
    [{ state: clusterStates.resuming }, 'Resuming'],
    [{ state: clusterStates.hibernating }, 'Hibernating'],
    [{ state: clusterStates.error }, 'Error'],
    [{ state: clusterStates.powering_down }, 'Powering down'],
    [{}, ''],
    [{ metricsState: 'running' }, 'Updating'],
  ])(
    'should show descriptions derived from %p expects to be %p',
    (
      props: {
        subStatus?: SubscriptionCommonFieldsStatus;
        state?: clusterStates | string;
        metricsState?: string;
      },
      expectedDescription: string,
    ) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultSubscription,
          status: props.subStatus,
        },
        metrics: {
          ...defaultMetric,
          upgrade: {
            state: props.metricsState,
          },
        },
        state: props.state,
      };
      const result = getClusterStateAndDescription(cluster);
      expect(result.description).toEqual(expectedDescription);
    },
  );

  describe('isWaitingROSAManualMode()', () => {
    const rosaManualCluster: ClusterFromSubscription = {
      ...defaultClusterFromSubscription,
      state: 'waiting',
      hypershift: { enabled: false },
      product: { id: 'ROSA' },
      aws: { sts: { auto_mode: false, oidc_config: {} } },
    };

    it.each([
      ['when is rosa and has a missing oidc config', true, rosaManualCluster],
      ['when state is not in waiting', false, { ...rosaManualCluster, state: 'ready' }],
      [
        'when is hypershift cluster',
        false,
        { ...rosaManualCluster, hypershift: { enabled: true } },
      ],
      ['when is not a ROSA cluster', false, { ...rosaManualCluster, product: { id: 'OSD' } }],
      [
        'when it is sts auto mode',
        false,
        { ...rosaManualCluster, aws: { sts: { auto_mode: true } } },
      ],
      [
        'when there is a oidc config',
        false,
        {
          ...rosaManualCluster,
          aws: { sts: { auto_mode: false, oidc_config: { id: 'my-oidc-id' } } },
        },
      ],
    ])(
      '%p it returns %p',
      (description: string, expectedResult: boolean, cluster: ClusterFromSubscription) => {
        expect(isWaitingROSAManualMode(cluster)).toBe(expectedResult);
      },
    );
  });

  describe('isHypershiftCluster', () => {
    describe('ClusterFromSubscription', () => {
      it.each([
        [normalizedProducts.ROSA_HyperShift, true, true],
        [normalizedProducts.ROSA_HyperShift, false, true],
        [normalizedProducts.ANY, true, true],
        [normalizedProducts.ANY, false, false],
      ])(
        'PlanId: %p, Hypersift Enabled: %p. It returns %p',
        (planId: string, hypershiftEnabled: boolean, expectedResult: boolean) => {
          const cluster: ClusterFromSubscription = {
            ...defaultClusterFromSubscription,
            subscription: {
              ...defaultSubscription,
              plan: {
                id: planId,
              },
            },
            hypershift: {
              enabled: hypershiftEnabled,
            },
          };
          expect(isHypershiftCluster(cluster)).toBe(expectedResult);
        },
      );
      it('undefined cluster. It returns false', () => {
        expect(isHypershiftCluster()).toBe(false);
      });
    });
    describe('Cluster', () => {
      it.each([
        [true, true],
        [false, false],
      ])(
        'Hypersift Enabled: %p. It returns %p',
        (hypershiftEnabled: boolean, expectedResult: boolean) => {
          const cluster: Cluster = {
            subscription: {},
            hypershift: {
              enabled: hypershiftEnabled,
            },
          };
          expect(isHypershiftCluster(cluster)).toBe(expectedResult);
        },
      );
    });
  });

  describe('isROSA', () => {
    it.each([
      [normalizedProducts.ROSA, true],
      [normalizedProducts.ROSA_HyperShift, false],
      [normalizedProducts.RHOSAK, false],
      [normalizedProducts.RHOSAK, false],
    ])('productId: %p. It returns %p', (productId: string, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        product: {
          id: productId,
        },
      };
      expect(isROSA(cluster)).toBe(expectedResult);
    });

    it('cluster undefined', () => {
      expect(isROSA(undefined)).toBe(false);
    });
  });

  describe('isWaitingForOIDCProviderOrOperatorRolesMode', () => {
    it.each([
      [ClusterState.waiting, 'whatever', true],
      [ClusterState.waiting, undefined, false],
      [ClusterState.hibernating, 'whatever', false],
    ])(
      'state: %p. It returns %p',
      (state: ClusterState, awsStsConfigId: string | undefined, expectedResult: boolean) => {
        const cluster: ClusterFromSubscription = {
          ...defaultClusterFromSubscription,
          product: {
            id: normalizedProducts.ROSA,
          },
          state,
          aws: {
            sts: {
              oidc_config: { id: awsStsConfigId },
            },
          },
        };
        expect(isWaitingForOIDCProviderOrOperatorRolesMode(cluster)).toBe(expectedResult);
      },
    );
  });

  describe('isWaitingHypershiftCluster', () => {
    it.each([
      [ClusterState.waiting, true],
      [ClusterState.hibernating, false],
    ])('state: %p. It returns %p', (state: ClusterState, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultSubscription,
          plan: {
            id: normalizedProducts.ROSA_HyperShift,
          },
        },
        hypershift: {
          enabled: true,
        },
        state,
      };
      expect(isWaitingHypershiftCluster(cluster)).toBe(expectedResult);
    });
  });

  describe('isOSD', () => {
    it.each([
      [normalizedProducts.OSD, true],
      [normalizedProducts.OSDTrial, true],
      [normalizedProducts.ANY, false],
    ])('productId: %p. It returns %p', (productId: string, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        product: {
          id: productId,
        },
      };
      expect(isOSD(cluster)).toBe(expectedResult);
    });
  });

  describe('isCCS', () => {
    it.each([
      [true, true],
      [false, false],
    ])('ccs enabled: %p. It returns %p', (ccsEnabled: boolean, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        ccs: {
          enabled: ccsEnabled,
        },
      };
      expect(isCCS(cluster)).toBe(expectedResult);
    });
  });

  describe('isAWSPrivateCluster', () => {
    it.each([
      [true, true],
      [false, false],
    ])(
      'private_link enabled: %p. It returns %p',
      (privateLinkEnabled: boolean, expectedResult: boolean) => {
        const cluster: ClusterFromSubscription = {
          ...defaultClusterFromSubscription,
          aws: {
            private_link: privateLinkEnabled,
          },
          ccs: {
            enabled: true,
          },
        };
        expect(isAWSPrivateCluster(cluster)).toBe(expectedResult);
      },
    );
  });

  describe('isAWS', () => {
    it.each([
      ['aws', true],
      ['gcp', false],
    ])('cloud provider: %p. It returns %p', (cloudProvider: string, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        subscription: {
          managed: true,
          cloud_provider_id: cloudProvider,
        },
      };
      expect(isAWS(cluster)).toBe(expectedResult);
    });
  });

  describe('isGCP', () => {
    it.each([
      ['aws', false],
      ['gcp', true],
    ])('cloud provider: %p. It returns %p', (cloudProvider: string, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        cloud_provider: {
          id: cloudProvider,
        },
      };
      expect(isGCP(cluster)).toBe(expectedResult);
    });
  });

  describe('isWIFCluster', () => {
    it.each([
      [
        'GCP CCS cluster with a WifConfig authentication reference',
        true,
        {
          cloud_provider: { id: 'gcp' },
          ccs: { enabled: true },
          gcp: { authentication: { kind: 'WifConfig', id: 'some-wif-config-id' } },
        },
      ],
      [
        'GCP CCS cluster without a WifConfig authentication reference (service account)',
        false,
        {
          cloud_provider: { id: 'gcp' },
          ccs: { enabled: true },
          gcp: {},
        },
      ],
      [
        'GCP cluster that is not CCS',
        false,
        {
          cloud_provider: { id: 'gcp' },
          ccs: { enabled: false },
          gcp: { authentication: { kind: 'WifConfig', id: 'some-wif-config-id' } },
        },
      ],
      [
        'non-GCP cluster',
        false,
        {
          cloud_provider: { id: 'aws' },
          ccs: { enabled: true },
          gcp: {},
        },
      ],
    ])('%s returns %s', (_title, expectedResult, clusterProps) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        ...clusterProps,
      };
      expect(isWIFCluster(cluster)).toBe(expectedResult);
    });
  });

  describe('isHibernating', () => {
    it.each([
      [ClusterState.hibernating, true],
      [ClusterState.powering_down, true],
      [ClusterState.resuming, true],
      ['resuming', true],
      [ClusterState.ready, false],
      [ClusterState.ready, false],
      ['ready', false],
      [undefined, false],
    ])(
      'state: %p. It returns %p',
      (state: ClusterState | string | undefined, expectedResult: boolean) => {
        const cluster: ClusterFromSubscription = {
          ...defaultClusterFromSubscription,
          state,
        };
        expect(isHibernating(cluster)).toBe(expectedResult);
      },
    );
  });

  describe('isOffline', () => {
    it.each([
      [ClusterState.hibernating, true],
      [ClusterState.powering_down, true],
      [ClusterState.resuming, true],
      [ClusterState.uninstalling, true],
      [ClusterState.ready, false],
    ])('state: %p. It returns %p', (state: ClusterState, expectedResult: boolean) => {
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        state,
      };
      expect(isOffline(cluster)).toBe(expectedResult);
    });
  });

  describe('cluster isClusterUpgrading', () => {
    it("is upgrading when metrics state is 'running'", () => {
      // Arrange
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        metrics: {
          ...defaultMetric,
          upgrade: {
            state: 'running',
          },
        },
      };

      // Act
      const isUpgrading = isClusterUpgrading(cluster);

      // Assert
      expect(isUpgrading).toBe(true);
    });

    it("is not upgrading when metrics state is not 'running'", () => {
      // Arrange
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        metrics: {
          ...defaultMetric,
          upgrade: {
            state: 'anything else',
          },
        },
      };

      // Act
      const isUpgrading = isClusterUpgrading(cluster);

      // Assert
      expect(isUpgrading).toBe(false);
    });

    it('is not upgrading when cluster is undefined', () => {
      // Act
      const isUpgrading = isClusterUpgrading();

      // Assert
      expect(isUpgrading).toBe(false);
    });
  });

  describe('cluster isClusterUpgradeCompleted', () => {
    it("is complete when metrics state is not 'completed'", () => {
      // Arrange
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        metrics: {
          ...defaultMetric,
          upgrade: {
            state: 'completed',
          },
        },
      };

      // Act
      const isUpgrading = isClusterUpgrading(cluster);
      const isComplete = isClusterUpgradeCompleted(cluster);
      // Assert
      expect(isUpgrading).toBe(false);
      expect(isComplete).toBe(true);
    });

    it("is not complete when metrics state is not 'completed'", () => {
      // Arrange
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        metrics: {
          ...defaultMetric,
          upgrade: {
            state: 'started',
          },
        },
      };

      // Act
      const isComplete = isClusterUpgradeCompleted(cluster);
      // Assert
      expect(isComplete).toBe(false);
    });
  });

  describe('getInflightChecks', () => {
    it('it is array', () => {
      // Arrange
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        inflight_checks: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      };

      // Act
      const inflightChecks = getInflightChecks(cluster);

      // Assert
      expect(inflightChecks).toStrictEqual([{ id: 'A' }, { id: 'B' }, { id: 'C' }]);
    });

    it('it is not array', () => {
      // Arrange
      const cluster: ClusterFromSubscription = {
        ...defaultClusterFromSubscription,
        inflight_checks: 'whatever' as any,
      };

      // Act
      const inflightChecks = getInflightChecks(cluster);

      // Assert
      expect(inflightChecks).toStrictEqual([]);
    });

    it('is undefined when cluster is undefined', () => {
      // Act
      const inflightChecks = getInflightChecks();

      // Assert
      expect(inflightChecks).toStrictEqual([]);
    });
  });

  describe('isOSDGCPWaitingForRolesOnHostProject', () => {
    const gcpProjectID = 'test-project';
    const defaultCluster = {
      ...defaultClusterFromSubscription,
      product: {
        id: normalizedProducts.OSD,
      },
      gcp_network: {
        vpc_project_id: gcpProjectID,
      },
      status: {
        state: ClusterState.waiting,
        description: `a description with ${gcpProjectID}`,
      },
    };

    it.each([
      [
        'is true if the cluster is OSD, the cluster status is "waiting" and its description contains the gcp project of the shared VPC',
        defaultCluster,
        true,
      ],
      [
        'is false if the cluster status is "waiting" but there is no state description',
        {
          ...defaultCluster,
          status: {
            ...defaultCluster.status,
            description: undefined,
          },
        },
        false,
      ],
      [
        "is false if there's no shared VPC configured",
        {
          ...defaultCluster,
          gcp_network: {},
        },
        false,
      ],
      [
        'is false if the status is "waiting" and the state description doesn\'t include the GCP project ID',
        {
          ...defaultCluster,
          status: {
            ...defaultCluster.status,
            description: 'a description without project id',
          },
        },
        false,
      ],
      [
        'is false if the cluster status is not "waiting"',
        {
          ...defaultCluster,
          status: {
            ...defaultCluster.status,
            state: ClusterState.installing,
          },
        },
        false,
      ],
      [
        'is false if the cluster is not OSD',
        {
          ...defaultCluster,
          product: {
            id: normalizedProducts.ROSA,
          },
        },
        false,
      ],
    ])('%s', (_title, cluster, result) => {
      const showPermissionsWarning = isOSDGCPWaitingForRolesOnHostProject(cluster);

      // Assert
      expect(showPermissionsWarning).toBe(result);
    });
  });
});
