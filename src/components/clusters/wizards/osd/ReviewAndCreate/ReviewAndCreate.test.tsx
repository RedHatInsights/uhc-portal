import React from 'react';
import { Formik } from 'formik';

import { CloudProviderType } from '~/components/clusters/wizards/common';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { ReviewAndCreate } from '~/components/clusters/wizards/osd/ReviewAndCreate/ReviewAndCreate';
import { OSD_GCP_WIF, Y_STREAM_CHANNEL } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';

const formValues = {
  product: 'OSD',
  byoc: 'true',
  cloud_provider: 'gcp',
  acknowledge_prerequisites: true,
  billing_model: 'standard',
  multi_az: 'false',
  selected_vpc: {
    id: '',
    name: '',
  },
  machinePoolsSubnets: [
    {
      availabilityZone: '',
      privateSubnetId: '',
      publicSubnetId: '',
    },
  ],
  securityGroups: {
    applyControlPlaneToAll: true,
    controlPlane: [],
    infra: [],
    worker: [],
  },
  install_to_shared_vpc: false,
  secure_boot: false,
  enable_user_workload_monitoring: true,
  node_labels: [
    {
      key: '',
      value: '',
    },
  ],
  cluster_privacy: 'external',
  cidr_default_values_enabled: true,
  network_machine_cidr: '10.0.0.0/16',
  network_service_cidr: '172.30.0.0/16',
  network_host_prefix: '/23',
  upgrade_policy: 'manual',
  automatic_upgrade_schedule: '0 0 * * 0',
  node_drain_grace_period: 60,
  persistent_storage: '107374182400',
  load_balancers: 0,
  disable_scp_checks: false,
  customer_managed_key: 'false',
  imds: 'optional',
  applicationIngress: 'default',
  defaultRouterExcludedNamespacesFlag: '',
  isDefaultRouterNamespaceOwnershipPolicyStrict: true,
  isDefaultRouterWildcardPolicyAllowed: false,
  cluster_autoscaling: {
    balance_similar_node_groups: false,
    balancing_ignored_labels: '',
    skip_nodes_with_local_storage: true,
    log_verbosity: 1,
    ignore_daemonsets_utilization: false,
    max_node_provision_time: '15m',
    max_pod_grace_period: 600,
    pod_priority_threshold: -10,
    resource_limits: {
      max_nodes_total: 180,
      cores: {
        min: 0,
        max: 11520,
      },
      memory: {
        min: 0,
        max: 230400,
      },
      gpus: '',
    },
    scale_down: {
      enabled: true,
      delay_after_add: '10m',
      delay_after_delete: '0s',
      delay_after_failure: '3m',
      utilization_threshold: '0.5',
      unneeded_time: '10m',
    },
  },
  domain_prefix: '',
  has_domain_prefix: false,
  gcp_auth_type: 'serviceAccounts',
  gcp_wif_config: '',
  marketplace_selection: null,
  region: 'us-east1',
  machine_type_force_choice: false,
  machine_type: 'n2-standard-4',
  fips: false,
  gcp_service_account: '{"type": "service_account" }',
  cluster_version: {
    kind: 'Version',
    id: 'openshift-v4.16.4',
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.16.4',
    raw_id: '4.16.4',
    enabled: true,
    default: true,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    hosted_control_plane_default: true,
    gcp_marketplace_enabled: true,
    end_of_life_timestamp: '2025-10-31T00:00:00Z',
    image_overrides: {
      aws: [],
      gcp: [],
    },
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:633d1d36e834a70baf666994ef375b9d1702bd1c54ab46f96c41223af9c2d150',
    release_images: {
      multi: {
        release_image:
          'quay.io/openshift-release-dev/ocp-release@sha256:b5544aaf2e463a0e8b79a5a7631cbeee35b2381d04bf69416191b8f485b2f530',
      },
    },
  },
  version_channel: 'fast-4.16',
  name: 're-test',
  nodes_compute: 2,
  network_pod_cidr: '10.128.0.0/14',
};

describe('<ReviewAndCreate />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={formValues} onSubmit={() => {}}>
        <ReviewAndCreate />
      </Formik>,
    );

    await checkAccessibility(container);
  });

  describe('OSD Google cloud provider', () => {
    it('shows service account when service account authentication is selected', () => {
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);

      render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <ReviewAndCreate />
        </Formik>,
      );

      expect(screen.getByText('Authentication type')).toBeInTheDocument();
      expect(screen.getByText('Service Account')).toBeInTheDocument();
      expect(screen.queryByText('Workload Identity Federation')).not.toBeInTheDocument();
      expect(screen.queryByText('WIF configuration')).not.toBeInTheDocument();
    });

    it('shows WIF info when WIF authentication is selected', () => {
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const wifConfigName = 'some-wif-config';
      const values = {
        ...formValues,
        gcp_auth_type: GCPAuthType.WorkloadIdentityFederation,
        gcp_wif_config: {
          display_name: wifConfigName,
        },
      };
      render(
        <Formik initialValues={values} onSubmit={() => {}}>
          <ReviewAndCreate />
        </Formik>,
      );

      expect(screen.getByText('Authentication type')).toBeInTheDocument();
      expect(screen.getByText('Workload Identity Federation')).toBeInTheDocument();
      expect(screen.getByText('WIF configuration')).toBeInTheDocument();
      expect(screen.getByText(wifConfigName)).toBeInTheDocument();

      expect(screen.queryByText('Service Account')).not.toBeInTheDocument();
    });

    it("doesn't show authentication type if WIF feature is disabled", () => {
      mockUseFeatureGate([[OSD_GCP_WIF, false]]);

      render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <ReviewAndCreate />
        </Formik>,
      );

      expect(screen.queryByText('Authentication type')).not.toBeInTheDocument();
      expect(screen.queryByText('Service Account')).not.toBeInTheDocument();
      expect(screen.queryByText('Workload Identity Federation')).not.toBeInTheDocument();
    });

    it("doesn't show previously selected WIF config when auth type is service account (going back and forth changing auth configuration)", () => {
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const wifConfigName = 'some-wif-config';
      render(
        <Formik
          initialValues={{
            ...formValues,
            gcp_auth_type: GCPAuthType.ServiceAccounts,
            gcp_wif_config: {
              display_name: wifConfigName,
            },
          }}
          onSubmit={() => {}}
        >
          <ReviewAndCreate />
        </Formik>,
      );

      expect(screen.getByText('Service Account')).toBeInTheDocument();
      expect(screen.queryByText('Workload Identity Federation')).not.toBeInTheDocument();
      expect(screen.queryByText('WIF configuration')).not.toBeInTheDocument();
      expect(screen.queryByText(wifConfigName)).not.toBeInTheDocument();
    });

    it.each([
      ["doesn't show authentication type for non-CCS clusters", { [FieldId.Byoc]: 'false' }],
      [
        "doesn't show authentication type for AWS clusters",
        { [FieldId.CloudProvider]: CloudProviderType.Aws },
      ],
    ])('%s', (_title: string, additionalValues: any) => {
      mockUseFeatureGate([[OSD_GCP_WIF, true]]);
      const values = {
        ...formValues,
        ...additionalValues,
      };
      render(
        <Formik initialValues={values} onSubmit={() => {}}>
          <ReviewAndCreate />
        </Formik>,
      );

      expect(screen.queryByText('Authentication type')).not.toBeInTheDocument();
    });

    describe('Private Service Connect field - when "Billing model": Subscription type is On-Demand Flexible usage billed through Google Cloud Marketplace, Infrastructure type: Customer cloud subscription & "Cluster Settings": Cloud provider is Google Cloud, authentication type is Workload Identity Federation & "Network Configuration": cluster privacy is set to Private (internal)', () => {
      const privateServiceConnectFormValues = {
        ...formValues,
        cluster_privacy: 'internal',
        billing_model: 'marketplace-gcp',
        gcp_auth_type: GCPAuthType.WorkloadIdentityFederation,
        [FieldId.InstallToVpc]: true,
      };

      it('shows Private Service Connect as "Disabled" by default', () => {
        render(
          <Formik initialValues={privateServiceConnectFormValues} onSubmit={() => {}}>
            <ReviewAndCreate />
          </Formik>,
        );

        expect(screen.getByText('Private service connect')).toBeInTheDocument();
        const value = screen.getByTestId('Private-service-connect');
        expect(value).toBeInTheDocument();
        expect(value.textContent).toBe('Disabled');
      });

      it('shows Private Service Connect as "Enabled" when form value is set to true', () => {
        render(
          <Formik
            initialValues={{
              ...privateServiceConnectFormValues,
              [FieldId.PrivateServiceConnect]: true,
            }}
            onSubmit={() => {}}
          >
            <ReviewAndCreate />
          </Formik>,
        );

        expect(screen.getByText('Private service connect')).toBeInTheDocument();
        const value = screen.getByTestId('Private-service-connect');
        expect(value).toBeInTheDocument();
        expect(value.textContent).toBe('Enabled');
      });
    });
  });

  describe('Channel', () => {
    it('is shown when Y_STREAM_CHANNEL feature gate is enabled', async () => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, true]]);

      render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <ReviewAndCreate />
        </Formik>,
      );

      expect(await screen.findByText('Channel')).toBeInTheDocument();
      expect(screen.getByText('fast-4.16')).toBeInTheDocument();
    });

    it('is not shown when Y_STREAM_CHANNEL feature gate is disabled', async () => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, false]]);

      render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <ReviewAndCreate />
        </Formik>,
      );

      await waitFor(() => {
        expect(screen.queryByText('Channel')).not.toBeInTheDocument();
      });
    });
  });
});
