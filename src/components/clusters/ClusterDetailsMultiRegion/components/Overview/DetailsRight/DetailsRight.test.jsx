import React from 'react';

import { ALLOW_EUS_CHANNEL } from '~/queries/featureGates/featureConstants';
import {
  checkAccessibility,
  mockRestrictedEnv,
  mockUseFeatureGate,
  render,
  screen,
  within,
} from '~/testUtils';

import { useFetchMachineOrNodePools } from '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { SubscriptionCommonFieldsStatus } from '../../../../../../types/accounts_mgmt.v1';
import fixtures from '../../../__tests__/ClusterDetails.fixtures';

import DetailsRight from './DetailsRight';
import machinePoolsFixtures from './DetailsRight.fixtures';

const defaultProps = {
  cluster: fixtures.clusterDetails.cluster,
  cloudProviders: fixtures.cloudProviders,
  hasAutoscaleCluster: false,
  clusterDetailsLoading: false,
  isDeprovisioned: false,
};

jest.mock(
  '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools',
);

const componentText = {
  STATUS: { label: 'Status', limitedSupport: '- Limited support' },
  STATUS_ERROR: { label: 'Details:' },
  VCPU: { label: 'Total vCPU', unit: 'vCPU' },
  TOTAL_MEMORY: { label: 'Total memory' },
  AWS_INFRA_ACCOUNT: { label: 'Infrastructure AWS account' },
  AWS_BILLING_ACCOUNT: { label: 'Billing marketplace account' },
  LOAD_BALANCERS: { label: 'Load balancers', NA: 'N/A' },
  PERSISTENT_STORAGE: { label: 'Persistent storage', NA: 'N/A' },
  NODES: {
    label: 'Nodes',
    CONTROL: 'Control plane:',
    INFRA: 'Infra:',
    COMPUTE: 'Compute:',
    NA: 'N/A',
  },
  CREATED_AT: { label: 'Created at', NA: 'N/A' },
  OWNER: { label: 'Owner', NA: 'N/A' },
  AUTOSCALE: { label: 'Autoscale', ENABLED: 'Enabled', MIN: 'Min:', MAX: 'Max:' },
  OIDC: {
    label: 'OIDC Configuration',
    TYPE: 'Type:',
    MANAGED: 'Red Hat managed',
    SELF: 'Self-managed',
    ID: 'ID:',
  },
  DELETE_PROTECTION: { label: 'Delete Protection' },
};

const checkForValue = (label, value, testId) => {
  // NOTE testID is used when there isn't an ARIA role to isolate parent container
  const container = testId ? within(screen.getByTestId(testId)) : screen;
  expect(container.getByText(label)).toBeInTheDocument();
  if (value) {
    expect(container.getByText(value)).toBeInTheDocument();

    // Verify that the value is below the label
    // Cannot use roles of "term" and "definition" because there are children elements
    const labelObj = container.getByText(label);
    expect(labelObj.closest('div').querySelector('dd')).toHaveTextContent(value);
  }
};

const checkForValueAbsence = (label, value, testId) => {
  // NOTE testID is used when there isn't an ARIA role to isolate parent container
  const container = testId ? within(screen.getByTestId(testId)) : screen;
  expect(container.queryByText(label)).not.toBeInTheDocument();
  if (value) {
    expect(container.queryByText(value)).not.toBeInTheDocument();
  }
};

describe('<DetailsRight />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('is accessible on initial render', async () => {
    // Arrange
    const newProps = { ...defaultProps };
    useFetchMachineOrNodePools.mockReturnValue({ data: [] });
    const { container } = render(<DetailsRight {...newProps} />);

    // Assert
    await checkAccessibility(container);
  });

  describe('status', () => {
    it('shows ai cluster status if ai subscription without metrics', () => {
      // Arrange
      const AIClusterFixture = {
        ...fixtures.AIClusterDetails.cluster,
        subscription: { ...fixtures.AIClusterDetails.cluster.subscription, metrics: [] },
      };
      const newProps = { ...defaultProps, cluster: AIClusterFixture };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      // NOTE there isn't an ARIA role to isolate parent container
      expect(screen.getByTestId('aiSubscriptionWithoutMetric')).toBeInTheDocument();
    });

    it('does not show ai cluster status if  ai subscription with metrics', () => {
      // Arrange
      const AIClusterFixture = fixtures.AIClusterDetails.cluster;
      expect(AIClusterFixture.subscription.metrics.length).toBeGreaterThan(0);

      const newProps = { ...defaultProps, cluster: AIClusterFixture };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      // NOTE there isn't an ARIA role to isolate parent container
      expect(screen.queryByTestId('aiSubscriptionWithoutMetric')).not.toBeInTheDocument();
    });

    it('shows limited support if cluster is in limited support', () => {
      // Arrange
      const newProps = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          status: {
            ...defaultProps.cluster.status,
            limited_support_reason_count: 1,
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      expect(screen.getByText(componentText.STATUS.limitedSupport)).toBeInTheDocument();
    });

    it('hides limited support if cluster is not in limited support', () => {
      // Arrange
      const newProps = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          status: {
            ...defaultProps.cluster.status,
            limited_support_reason_count: 0,
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      expect(screen.queryByText(componentText.STATUS.limitedSupport)).not.toBeInTheDocument();
    });

    it('shows error if cluster has a provision error', () => {
      // Arrange
      const clusterErrorFixture = {
        ...fixtures.clusterDetails.cluster,
        status: {
          ...fixtures.clusterDetails.cluster.status,
          provision_error_code: '1234',
          provision_error_message: 'this is an error',
        },
      };
      const newProps = { ...defaultProps, cluster: clusterErrorFixture };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.STATUS_ERROR.label, '1234 this is an error');
    });

    it('hides error if cluster does not have a provision error', () => {
      // Arrange
      expect(defaultProps.cluster.status.provision_error_code).toBeFalsy();
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...defaultProps} />);

      // Assert
      checkForValueAbsence(componentText.STATUS_ERROR.label);
    });

    it('renders URLs embedded in provision errors as links', () => {
      // Arrange
      const clusterErrorFixture = {
        ...fixtures.clusterDetails.cluster,
        status: {
          ...fixtures.clusterDetails.cluster.status,
          provision_error_code: 'OCM3055',
          provision_error_message:
            "Your cluster's installation role does not have permissions to use the default KMS key in your AWS account. Ensure that the installation role has permissions to use this key and try again. If you're using a custom KMS key, ensure the key exists. Learn more: https://access.redhat.com/solutions/7048553",
        },
      };
      const newProps = { ...defaultProps, cluster: clusterErrorFixture };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(
        componentText.STATUS_ERROR.label,
        /OCM3055 Your cluster's installation role does not have permissions/,
      );
      expect(screen.getByText('https://access.redhat.com/solutions/7048553')).toHaveRole('link');
      expect(screen.getByText('https://access.redhat.com/solutions/7048553')).toHaveAttribute(
        'href',
      );
    });

    it('shows delete protection', () => {
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      // Arrange
      render(<DetailsRight {...defaultProps} />);

      // Assert
      checkForValue(componentText.DELETE_PROTECTION.label);
    });

    it('hides delete protection if cluster is archived', () => {
      // Arrange
      const cluster = {
        ...fixtures.clusterDetails.cluster,
        subscription: { status: 'Archived', id: 'fake' },
      };
      const props = { ...defaultProps, cluster };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...props} />);

      // Assert
      checkForValueAbsence(componentText.DELETE_PROTECTION.label);
    });
  });

  describe('virtual CPU', () => {
    it('shows total VPC if cluster is not disconnected and does not have sockets', () => {
      // Arrange
      expect(defaultProps.cluster.subscription.status).not.toEqual(
        SubscriptionCommonFieldsStatus.Disconnected,
      );
      expect(defaultProps.cluster.metrics.sockets.total.value).toBeFalsy();

      const numberOfVCPU = 36;
      expect(defaultProps.cluster.metrics.cpu.total.value).toEqual(numberOfVCPU);
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...defaultProps} />);

      // Assert
      checkForValue(componentText.VCPU.label, `${numberOfVCPU} ${componentText.VCPU.unit}`);
    });

    it('hides VPC if cluster is disconnected', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;
      expect(clusterFixture.metrics.sockets.total.value).toBeFalsy();

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          subscription: {
            ...clusterFixture.subscription,
            status: SubscriptionCommonFieldsStatus.Disconnected,
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.VCPU.label);
    });

    it('does not show vpc if number of sockets is greater than 0', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;
      expect(clusterFixture.subscription.status).not.toEqual(
        SubscriptionCommonFieldsStatus.Disconnected,
      );

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          metrics: {
            ...clusterFixture.metrics,
            sockets: {
              ...clusterFixture.metrics.sockets,
              total: { value: 100 },
            },
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.VCPU.label);
    });
  });

  describe('total memory', () => {
    it('hides total memory  if cluster is disconnected', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          subscription: {
            ...clusterFixture.subscription,
            status: SubscriptionCommonFieldsStatus.Disconnected,
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.TOTAL_MEMORY.label);
    });

    it('shows total memory label if cluster is not disconnected', () => {
      // Arrange
      expect(defaultProps.cluster.subscription.status).not.toEqual(
        SubscriptionCommonFieldsStatus.Disconnected,
      );
      const memory = defaultProps.cluster.metrics.memory.total;
      expect(memory.value).toEqual(147469647872);
      expect(memory.unit).toEqual('B');
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...defaultProps} />);

      // Assert
      checkForValue(componentText.TOTAL_MEMORY.label, '137.34 GiB');
    });
  });

  describe('aws infrastructure account', () => {
    it('shows aws infrastructure account if aws account is known', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          subscription: {
            ...clusterFixture.subscription,
            cloud_account_id: '987654321012',
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.AWS_INFRA_ACCOUNT.label, '987654321012');
      expect(screen.getByText('Infrastructure AWS account')).toBeInTheDocument();
    });

    it('hides aws infrastructure account if aws account is not known', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          subscription: {
            ...clusterFixture.subscription,
            cloud_account_id: undefined,
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.AWS_INFRA_ACCOUNT.label);
    });

    it('shows correct text for GCP', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          cloud_provider: {
            kind: 'CloudProviderLink',
            id: 'gcp',
            href: '/api/clusters_mgmt/v1/cloud_providers/gcp',
          },
          subscription: {
            ...clusterFixture.subscription,
            cloud_account_id: 'fake-id',
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      expect(screen.getByText('Infrastructure Google Cloud account')).toBeInTheDocument();
    });
  });

  describe('Load balancers and storage', () => {
    it('hides load balancers and storage if cluster is not managed', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: false,
          ccs: { enabled: false },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.LOAD_BALANCERS.label);
      checkForValueAbsence(componentText.PERSISTENT_STORAGE.label);
    });

    it('hides load balancers and storage if cluster  does has ccs enabled', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: true,
          ccs: { enabled: true },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.LOAD_BALANCERS.label);
      checkForValueAbsence(componentText.PERSISTENT_STORAGE.label);
    });

    it('shows load balancer quota when known', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: true,
          ccs: { enabled: false },
          load_balancer_quota: '100',
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });
      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.LOAD_BALANCERS.label, '100');
      checkForValue(componentText.PERSISTENT_STORAGE.label);
    });

    it('shows load balancer quota as "NA" if it is not known', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: true,
          ccs: { enabled: false },
          load_balancer_quota: undefined,
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.LOAD_BALANCERS.label, componentText.LOAD_BALANCERS.NA);
      checkForValue(componentText.PERSISTENT_STORAGE.label);
    });

    it('shows persistent storage when it is known', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: true,
          ccs: { enabled: false },
          storage_quota: {
            value: 107374182400,
            unit: 'B',
          },
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.LOAD_BALANCERS.label);
      checkForValue(componentText.PERSISTENT_STORAGE.label, '100 GiB');
    });

    it('shows persistent storage quota as "NA" if it is not known', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: true,
          ccs: { enabled: false },
          load_balancer_quota: '100',
          storage_quota: undefined,
        },
      };
      useFetchMachineOrNodePools.mockReturnValue({ data: [] });

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.LOAD_BALANCERS.label);
      checkForValue(componentText.PERSISTENT_STORAGE.label, componentText.PERSISTENT_STORAGE.NA);
    });
  });

  describe('Nodes', () => {
    describe('Has disabled MachinePool autoscale and is managed', () => {
      describe('Control plane', () => {
        it('hides header if hypershift', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: true },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          expect(screen.queryByTestId('controlPlaneNodesCountContainer')).not.toBeInTheDocument();
        });

        it('shows  actual counts if not hypershift and actual nodes  is known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { master: undefined },
              metrics: { ...clusterFixture.metrics, nodes: { master: 12 } },
            },
          };
          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.CONTROL, '12/-', 'controlPlaneNodesCountContainer');
        });

        it('shows  desired  counts if not hypershift and  desired nodes is known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { master: 34 },
              metrics: { ...clusterFixture.metrics, nodes: { master: undefined } },
            },
          };
          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.CONTROL, '-/34', 'controlPlaneNodesCountContainer');
        });

        it('shows both desired and actual counts if not hypershift and both are known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { master: 34 },
              metrics: { ...clusterFixture.metrics, nodes: { master: 12 } },
            },
          };

          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.CONTROL, '12/34', 'controlPlaneNodesCountContainer');
        });

        it('shows "NA" if not hypershift and actual nodes and desired nodes are not known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { master: undefined },
              metrics: { ...clusterFixture.metrics, nodes: { master: undefined } },
            },
          };
          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(
            componentText.NODES.CONTROL,
            componentText.NODES.NA,
            'controlPlaneNodesCountContainer',
          );
        });
      });

      describe('Infra nodes', () => {
        it('hides  header if hypershift', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: true },
            },
          };

          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          expect(screen.queryByTestId('InfraNodesCountContainer')).not.toBeInTheDocument();
        });

        it('hides  header if infra nodes is equal to 0', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { infra: 0 },
            },
          };
          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          expect(screen.queryByTestId('InfraNodesCountContainer')).not.toBeInTheDocument();
        });

        it('shows header if infra nodes is known and larger than 0', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { infra: 111 },
            },
          };
          useFetchMachineOrNodePools.mockReturnValue({ data: [] });

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.INFRA, undefined, 'InfraNodesCountContainer');
        });

        it('shows  desired  count  when  header is shown ', () => {
          // Arrange
          useFetchMachineOrNodePools.mockReturnValue({
            data: [],
          });
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { infra: 111 },
              metrics: { ...clusterFixture.metrics, nodes: { infra: undefined } },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.INFRA, '-/111', 'InfraNodesCountContainer');
        });

        it('shows infra node actual and desired count when infra header is shown and actual infra nodes is known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              managed: true,
              hypershift: { enabled: false },
              nodes: { infra: 111 },
              metrics: { ...clusterFixture.metrics, nodes: { infra: 222 } },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.INFRA, '222/111', 'InfraNodesCountContainer');
        });
      });

      describe('Compute nodes', () => {
        it('shows number  desired worker nodes if  desired count is known', () => {
          // Arrange
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithoutAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithoutAutoScale,
          });

          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            cluster: {
              ...clusterFixture,
              metrics: {
                ...clusterFixture.metrics,
                nodes: {
                  total: 5,
                  master: 3,
                  infra: 2,
                },
              },
              managed: true,
              hypershift: { enabled: false },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.COMPUTE, '-/6');
        });

        it('shows number of actual worker nodes if  actual  count is known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(
          //   machinePoolsFixtures.nodePoolsWithoutAutoScaleWithNoReplicas,
          // );
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithoutAutoScaleWithNoReplicas,
          });

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            totalDesiredComputeNodes: undefined,
            cluster: {
              ...clusterFixture,
              metrics: {
                ...clusterFixture.metrics,
                nodes: {
                  total: 5,
                  master: 3,
                  infra: 2,
                  compute: 222,
                },
              },
              managed: true,
              hypershift: { enabled: false },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.COMPUTE, '222/-');
        });

        it('shows both actual and desired worker nodes if both are known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithoutAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithoutAutoScale,
          });

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            totalDesiredComputeNodes: 6,
            totalActualNodes: 222,
            cluster: {
              ...clusterFixture,
              metrics: {
                ...clusterFixture.metrics,
                nodes: {
                  total: 5,
                  master: 3,
                  infra: 2,
                  compute: 222,
                },
              },
              managed: true,
              hypershift: { enabled: false },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.COMPUTE, '222/6');
        });

        it('shows "NA" for worker nodes if both actual and desired count is not known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(
          //   machinePoolsFixtures.nodePoolsWithoutAutoScaleWithNoReplicas,
          // );
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithoutAutoScaleWithNoReplicas,
          });

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: false,
            cluster: {
              ...clusterFixture,
              metrics: {
                ...clusterFixture.metrics,
                nodes: {
                  total: 5,
                  master: 3,
                  infra: 2,
                },
              },
              managed: true,
              hypershift: { enabled: false },
              ccs: { enabled: false },
              load_balancer_quota: '100',
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.COMPUTE, componentText.NODES.NA);
        });
      });
    });

    describe('Is autoscaled OR not managed', () => {
      describe('Control plane', () => {
        it('hides header if hypershift', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: true },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          expect(screen.queryByTestId('controlPlaneNodesCountContainer')).not.toBeInTheDocument();
        });

        it('shows count if not hypershift and  count is known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithAutoScale,
          });

          const newProps = {
            ...defaultProps,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: false },
              metrics: { ...clusterFixture.metrics, nodes: { master: 111 } },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.CONTROL, '111', 'controlPlaneNodesCountContainer');
        });

        it('shows "NA" for control plane count if not hypershift and node count is unknown', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithAutoScale,
          });

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: false },
              metrics: { ...clusterFixture.metrics, nodes: { master: undefined } },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(
            componentText.NODES.CONTROL,
            componentText.NODES.NA,
            'controlPlaneNodesCountContainer',
          );
        });
      });

      describe('Infra nodes', () => {
        it('hides infra header if hypershift', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: true },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          expect(screen.queryByTestId('InfraNodesCountContainer')).not.toBeInTheDocument();
        });

        it('hides  header if infra nodes is equal to 0', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,

              hypershift: { enabled: false },
              nodes: { infra: 0 },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          expect(screen.queryByTestId('InfraNodesCountContainer')).not.toBeInTheDocument();
        });

        it('shows header if infra nodes is known and larger than 0', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;

          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: false },
              nodes: { infra: 111 },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.INFRA, undefined, 'InfraNodesCountContainer');
        });

        it('shows infra node count (via metrics) when infra header is shown and node count is known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithAutoScale,
          });
          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: false },
              nodes: { infra: 111 },
              metrics: { ...clusterFixture.metrics, nodes: { infra: 222 } },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.INFRA, '222', 'InfraNodesCountContainer');
        });

        it('shows NA when infra header is shown and node count not known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithAutoScale,
          });
          const newProps = {
            ...defaultProps,
            hasAutoscaleMachinePools: true,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: false },
              nodes: { infra: 111 },
              metrics: { ...clusterFixture.metrics, nodes: { infra: undefined } },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(
            componentText.NODES.INFRA,
            componentText.NODES.NA,
            'InfraNodesCountContainer',
          );
        });
      });

      describe('Compute nodes', () => {
        it('shows total compute nodes  if known', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScale);
          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithAutoScale,
          });
          const newProps = {
            ...defaultProps,
            cluster: {
              ...clusterFixture,
              hypershift: { enabled: false },
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.COMPUTE, '4');
        });

        it('shows "NA" for compute count if total account modes is not known ', () => {
          // Arrange
          const clusterFixture = defaultProps.cluster;
          // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScaleWithNoReplicas);

          useFetchMachineOrNodePools.mockReturnValue({
            data: machinePoolsFixtures.nodePoolsWithAutoScaleWithNoReplicas,
          });

          const newProps = {
            ...defaultProps,
            cluster: {
              ...clusterFixture,
              metrics: {
                ...clusterFixture.metrics,
                nodes: {
                  master: 3,
                  infra: 2,
                  availability_zones: ['us-east-1a'],
                },
              },
              hypershift: { enabled: false },
              ccs: { enabled: false },
              load_balancer_quota: '100',
            },
          };

          render(<DetailsRight {...newProps} />);

          // Assert
          checkForValue(componentText.NODES.COMPUTE, componentText.NODES.NA);
        });
      });
    });
  });

  describe('Created by and owner', () => {
    it('hides created at and owner headings if not an aiCluster', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aiCluster: false,
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.CREATED_AT.label);
      checkForValueAbsence(componentText.OWNER.label);
    });

    it('shows created at heading if an aiCluster', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aiCluster: true,
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.CREATED_AT.label);
    });

    it('shows creator name as the owner', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aiCluster: true,
          subscription: { ...clusterFixture.subscription, creator: { name: 'myName' } },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.OWNER.label, 'myName');
    });

    it('shows creator username if name is not available as owner ', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aiCluster: true,
          subscription: {
            ...clusterFixture.subscription,
            creator: { name: undefined, username: 'myUserName' },
          },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.OWNER.label, 'myUserName');
    });

    it('shows "N/A" as the owner if creator name and creator username are not available', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;
      // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithoutAutoScale);
      useFetchMachineOrNodePools.mockReturnValue({
        data: machinePoolsFixtures.nodePoolsWithoutAutoScale,
      });

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          managed: true,
          ccs: { enabled: false },
          load_balancer_quota: '100',
          aiCluster: true,
          subscription: {
            ...clusterFixture.subscription,
            creator: {},
          },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.OWNER.label, componentText.OWNER.NA);
    });
  });

  describe('autoscaling', () => {
    it('hides MP autoscaling header if MP autoscale not enabled', () => {
      // Arrange
      const newProps = {
        ...defaultProps,
      };
      // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithoutAutoScale);
      useFetchMachineOrNodePools.mockReturnValue({
        data: machinePoolsFixtures.nodePoolsWithoutAutoScale,
      });

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.AUTOSCALE.label);
    });

    it('shows "enabled", min node count, and max node count if MP autoscale is enabled', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;
      // useGlobalState.mockReturnValue(machinePoolsFixtures.nodePoolsWithAutoScale);
      useFetchMachineOrNodePools.mockReturnValue({
        data: machinePoolsFixtures.nodePoolsWithAutoScale,
      });

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          hypershift: { enabled: true },
        },
        clusterDetailsLoading: false,
        isDeprovisioned: false,
        hasAutoscaleCluster: false,
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.AUTOSCALE.label);
      expect(screen.getByText(componentText.AUTOSCALE.ENABLED)).toBeInTheDocument();
      expect(screen.getByText(/2222/)).toHaveTextContent(`${componentText.AUTOSCALE.MIN} 2222`);
      expect(screen.getByText(/4444/)).toHaveTextContent(`${componentText.AUTOSCALE.MAX} 4444`);
    });
  });

  describe('OIDC config', () => {
    it('hides "OIDC Configuration" heading if the oidcConfig does not exist', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aws: {
            sts: { oidc_config: undefined },
          },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValueAbsence(componentText.OIDC.label);
    });

    it('shows OIDC config id if oidcConfig exists', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aws: {
            sts: { oidc_config: { id: 'myID' } },
          },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.OIDC.label);
      checkForValue(componentText.OIDC.ID, 'myID');
    });

    it('shows "Red Hat managed" for type if oidcConfig exists and is managed', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aws: {
            sts: { oidc_config: { managed: true } },
          },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.OIDC.label);
      checkForValue(componentText.OIDC.TYPE, componentText.OIDC.MANAGED);
    });

    it('shows "Self-managed" for type if oidcConfig exists and is not managed', () => {
      // Arrange
      const clusterFixture = defaultProps.cluster;

      const newProps = {
        ...defaultProps,
        cluster: {
          ...clusterFixture,
          aws: {
            sts: { oidc_config: { managed: undefined } },
          },
        },
      };

      render(<DetailsRight {...newProps} />);

      // Assert
      checkForValue(componentText.OIDC.label);
      checkForValue(componentText.OIDC.TYPE, componentText.OIDC.SELF);
    });
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();

    afterAll(() => {
      isRestrictedEnv.mockReturnValue(false);
    });
    it('Wont show telemetry fields', () => {
      isRestrictedEnv.mockReturnValue(true);
      render(<DetailsRight {...defaultProps} />);
      expect(screen.queryByText(componentText.VCPU.label)).not.toBeInTheDocument();
      expect(screen.queryByText(componentText.TOTAL_MEMORY.label)).not.toBeInTheDocument();
      expect(screen.queryByText(componentText.NODES.label)).not.toBeInTheDocument();
    });
  });
});
