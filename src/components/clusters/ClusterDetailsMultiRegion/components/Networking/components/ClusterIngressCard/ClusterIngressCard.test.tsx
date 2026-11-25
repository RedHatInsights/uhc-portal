import * as React from 'react';

import { HCP_CUSTOM_COMPONENT_ROUTES } from '~/queries/featureGates/featureConstants';
import { Ingress } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import {
  mockRestrictedEnv,
  mockUseFeatureGate,
  render,
  screen,
} from '../../../../../../../testUtils';

import { ClusterIngressCard } from './ClusterIngressCard';

describe('<ClusterIngressCard />', () => {
  const cluster = {
    openshift_version: '4.13.4',
    api: { url: 'controlPlaneAPIEndpoint', listening: 'external' },
    cloud_provider: {
      id: 'AWS',
    },
    console: {
      url: 'consoleURL',
    },
    canEdit: false,
    status: {
      configuration_mode: 'active',
    },
    aws: {
      sts: {
        enabbled: false,
      },
    },
    state: 'ACTIVE',
    hypershift: {
      enabled: true,
    },
  } as any as AugmentedCluster;
  const clusterRouters = [
    {
      default: true,
      dns_name: 'apps.rosa.re-hcp-1.2njp.s3.devshift.org',
      href: '/api/clusters_mgmt/v1/clusters/2clvgtqnbndaceirn0q5mkkpp0g4ome8/ingresses/v7m8',
      id: 'v7m8',
      kind: 'Ingress',
      listening: 'external',
      load_balancer_type: 'nlb',
    },
  ] as Ingress[];
  const defaultProps = {
    clusterRoutersData: clusterRouters,
    cluster,
    refreshCluster: jest.fn(),
  };

  describe('in default environment', () => {
    it('renders footer', async () => {
      render(<ClusterIngressCard {...defaultProps} />);
      expect(screen.queryByText('Edit cluster ingress')).toBeInTheDocument();
    });

    it('renders the API as public when isApiPrivate=false', async () => {
      render(<ClusterIngressCard {...defaultProps} />);
      expect(screen.queryByText('Public API')).toBeInTheDocument();
      expect(screen.queryByText('Private API')).not.toBeInTheDocument();
    });

    it('renders the API as private when isApiPrivate=true', async () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          api: {
            listening: 'internal',
          },
        } as AugmentedCluster,
      };

      render(<ClusterIngressCard {...props} />);

      expect(screen.queryByText('Public API')).not.toBeInTheDocument();
      expect(screen.queryByText('Private API')).toBeInTheDocument();
    });
  });
  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();

    beforeAll(() => {
      isRestrictedEnv.mockReturnValue(true);
    });

    afterAll(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    it('does not render footer', async () => {
      render(<ClusterIngressCard {...defaultProps} />);
      expect(screen.queryByText('Edit cluster ingress')).not.toBeInTheDocument();
    });

    it('renders the API as private in any case', async () => {
      const { rerender } = render(<ClusterIngressCard {...defaultProps} />);
      expect(screen.queryByText('Private API')).toBeInTheDocument();

      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          api: {
            listening: 'internal',
          },
        } as AugmentedCluster,
      };
      rerender(<ClusterIngressCard {...props} />);
      expect(screen.queryByText('Private API')).toBeInTheDocument();
    });
  });
  describe('ROSA classic', () => {
    it('disables editing cluster ingress', async () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          hypershift: {
            enabled: false,
          },
          aws: {
            sts: {
              enabbled: true,
            },
          },
        } as AugmentedCluster,
      };
      render(<ClusterIngressCard {...props} />);
      expect(screen.getByTestId('edit-cluster-ingress')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Console URL pending alert', () => {
    const alertTitle =
      'The Cluster console URL may take a few moments to update after you change the Console hostname.';

    const mismatchedProps = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        console: { url: 'https://console-openshift-console.apps.example.com' },
      } as AugmentedCluster,
      clusterRoutersData: [
        {
          ...clusterRouters[0],
          component_routes: {
            console: {
              hostname: 'console.example.com',
              tls_secret_ref: 'console-tls',
            },
          },
        },
      ] as Ingress[],
    };

    beforeEach(() => {
      mockUseFeatureGate([[HCP_CUSTOM_COMPONENT_ROUTES, true]]);
    });

    it('shows an info alert when Console hostname does not match Cluster console URL', () => {
      render(<ClusterIngressCard {...mismatchedProps} />);

      expect(screen.getByText(alertTitle)).toBeInTheDocument();
    });

    it('hides the alert when Console hostname matches Cluster console URL', () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          console: { url: 'https://console.example.com' },
        } as AugmentedCluster,
        clusterRoutersData: [
          {
            ...clusterRouters[0],
            component_routes: {
              console: {
                hostname: 'console.example.com',
                tls_secret_ref: 'console-tls',
              },
            },
          },
        ] as Ingress[],
      };

      render(<ClusterIngressCard {...props} />);

      expect(screen.queryByText(alertTitle)).not.toBeInTheDocument();
    });

    it('hides the alert when Console hostname is not configured and URL is on the default host', () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          console: {
            url: 'https://console-openshift-console.apps.rosa.re-hcp-1.2njp.s3.devshift.org',
          },
        } as AugmentedCluster,
      };

      render(<ClusterIngressCard {...props} />);

      expect(screen.queryByText(alertTitle)).not.toBeInTheDocument();
    });

    it('shows the alert when Console hostname is cleared but URL is still on the custom host', () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          console: { url: 'https://console.example.com' },
        } as AugmentedCluster,
        clusterRoutersData: [
          {
            ...clusterRouters[0],
            component_routes: {
              console: {
                hostname: '',
                tls_secret_ref: '',
              },
            },
          },
        ] as Ingress[],
      };

      render(<ClusterIngressCard {...props} />);

      expect(screen.getByText(alertTitle)).toBeInTheDocument();
    });

    it('hides the alert on Classic even when Console hostname does not match', () => {
      const props = {
        ...mismatchedProps,
        cluster: {
          ...mismatchedProps.cluster,
          hypershift: { enabled: false },
        } as AugmentedCluster,
      };

      render(<ClusterIngressCard {...props} />);

      expect(screen.queryByText(alertTitle)).not.toBeInTheDocument();
    });

    it('hides the alert when feature gate is off', () => {
      mockUseFeatureGate([[HCP_CUSTOM_COMPONENT_ROUTES, false]]);

      render(<ClusterIngressCard {...mismatchedProps} />);

      expect(screen.queryByText(alertTitle)).not.toBeInTheDocument();
    });
  });

  describe('OSD GCP WIF cluster', () => {
    it('disables editing cluster ingress', async () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          canEdit: true,
          cloud_provider: {
            id: 'gcp',
          },
          ccs: {
            enabled: true,
          },
          gcp: {
            authentication: {
              kind: 'WifConfig',
              id: 'some-wif-config-id',
            },
          },
          hypershift: {
            enabled: false,
          },
        } as AugmentedCluster,
      };
      const { user } = render(<ClusterIngressCard {...props} />);
      const editButton = screen.getByTestId('edit-cluster-ingress');
      expect(editButton).toHaveAttribute('aria-disabled', 'true');

      await user.hover(editButton);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Cluster ingress cannot be edited for OSD clusters using Workload Identity Federation (WIF)',
      );
    });

    it('does not disable editing cluster ingress for OSD GCP service account clusters', async () => {
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          canEdit: true,
          cloud_provider: {
            id: 'gcp',
          },
          ccs: {
            enabled: true,
          },
          gcp: {},
          hypershift: {
            enabled: false,
          },
        } as AugmentedCluster,
      };
      render(<ClusterIngressCard {...props} />);
      const editButton = screen.getByTestId('edit-cluster-ingress');
      expect(editButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});
