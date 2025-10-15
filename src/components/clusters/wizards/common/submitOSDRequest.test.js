import pick from 'lodash/pick';

import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';

import { normalizedProducts } from '../../../../common/subscriptionTypes';

import { createClusterRequest } from './submitOSDRequest';

describe('createClusterRequest', () => {
  // These tests were captured from logging actual arguments passed to submitOSDRequest().
  // I hope we can keep them in sync with reality...

  // Common fields (as of Jan 2022, likely incomplete over time).
  const baseFormData = {
    name: 'test-name',
    nodes_compute: '9',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    region: 'somewhere', // GCP defaults 'us-east1', AWS 'us-east-1', not important here.
    multi_az: 'true',
    persistent_storage: '107374182400',
    load_balancers: '0',
    network_configuration_toggle: 'basic',
    disable_scp_checks: false,
    node_drain_grace_period: 60,
    upgrade_policy: 'manual',
    automatic_upgrade_schedule: '0 0 * * 0',
    node_labels: [{}],
    enable_user_workload_monitoring: true,
    machine_type: 'PDP-11', // GCP defaults 'custom-4-16384', AWS 'm5.xlarge' not important here.
    cluster_version: {
      kind: 'Version',
      id: 'openshift-v4.17.1',
      href: '/api/clusters_mgmt/v1/versions/openshift-v4.17.1',
      raw_id: '4.17.1',
      enabled: true,
      default: true,
      channel_group: 'stable',
      rosa_enabled: true,
      end_of_life_timestamp: '2022-07-18T00:00:00Z',
    },
  };

  const rosaFormData = {
    ...baseFormData,
    product: normalizedProducts.ROSA,
    associated_aws_id: '123456789',
    installer_role_arn: 'arn:aws:iam::123456789:role/Foo-Installer-Role',
    support_role_arn: 'arn:aws:iam::123456789:role/Foo-Support-Role',
    control_plane_role_arn: 'arn:aws:iam::123456789:role/Foo-ControlPlane-Role',
    worker_role_arn: 'arn:aws:iam::123456789:role/Foo-Worker-Role',
    role_mode: 'manual',
    securityGroups: {
      applyControlPlaneToAll: false,
      controlPlane: [],
      infra: [],
      worker: [],
    },
    node_drain_grace_period: 60,
    // TODO: can finish ROSA wizard with machine_type not set?
  };

  const gcpVPCData = {
    install_to_vpc: true,
    vpc_name: 'nsimha-test-1-sd8x8-network',
    control_plane_subnet: 'nsimha-test-1-sd8x8-master-subnet',
    compute_subnet: 'nsimha-test-1-sd8x8-worker-subnet',
  };

  const expectGCPVPC = (request) => {
    expect(request.gcp_network).toEqual({
      compute_subnet: 'nsimha-test-1-sd8x8-worker-subnet',
      control_plane_subnet: 'nsimha-test-1-sd8x8-master-subnet',
      vpc_name: 'nsimha-test-1-sd8x8-network',
    });
  };

  const awsRosaOsdVPCData = {
    install_to_vpc: true,
    selected_vpc: {
      id: 'vpc-id',
      aws_subnets: [
        {
          availability_zone: 'us-east-1d',
          subnet_id: 'subnet-00b3753ab2dd892ac',
          public: false,
        },
        {
          availability_zone: 'us-east-1d',
          subnet_id: 'subnet-0703ec90283d1fd6b',
          public: true,
        },
        {
          availability_zone: 'us-east-1e',
          subnet_id: 'subnet-0735da52d658da28b',
          public: false,
        },
        {
          availability_zone: 'us-east-1e',
          subnet_id: 'subnet-09404f4fc139bd94e',
          public: true,
        },
        {
          availability_zone: 'us-east-1f',
          subnet_id: 'subnet-00327948731118662',
          public: false,
        },
        {
          availability_zone: 'us-east-1f',
          subnet_id: 'subnet-09ad4ef49f2e29996',
          public: true,
        },
      ],
    },
    machinePoolsSubnets: [
      {
        availabilityZone: 'us-east-1d',
        privateSubnetId: 'subnet-00b3753ab2dd892ac',
        publicSubnetId: 'subnet-0703ec90283d1fd6b',
      },
      {
        availabilityZone: 'us-east-1e',
        privateSubnetId: 'subnet-0735da52d658da28b',
        publicSubnetId: 'subnet-09404f4fc139bd94e',
      },
      {
        availabilityZone: 'us-east-1f',
        privateSubnetId: 'subnet-00327948731118662',
        publicSubnetId: 'subnet-09ad4ef49f2e29996',
      },
    ],
  };

  const expectAWSVPC = (request) => {
    expect(request.aws.subnet_ids).toEqual([
      'subnet-00b3753ab2dd892ac',
      'subnet-0703ec90283d1fd6b',
      'subnet-0735da52d658da28b',
      'subnet-00327948731118662',
      'subnet-09404f4fc139bd94e',
      'subnet-09ad4ef49f2e29996',
    ]);
    expect(request.nodes.availability_zones).toEqual(['us-east-1d', 'us-east-1e', 'us-east-1f']);
  };

  const CIDRData = {
    network_machine_cidr: '10.1.128.0/17',
    network_host_prefix: '24',
  };

  const expectCIDR = (request) => {
    expect(request.network).toEqual({
      machine_cidr: '10.1.128.0/17',
      host_prefix: 24,
    });
  };

  const gcpServiceAccount = {
    type: 'service_account',
    project_id: 'sa-project-id',
    private_key_id: '13K16EWTCR1NNFU3P5K99CRMFJC6L9TP4HRQDYYY',
    private_key: '-----BEGIN PRIVATE KEY-----\n***REMOVED***\n-----END PRIVATE KEY-----\n',
    client_email: 'user@email.iam.gserviceaccount.com',
    client_id: '22TPSDA33N0FAU3KL2KP5',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/***REMOVED***',
    universe_domain: 'googleapis.com',
  };

  describe('custom CIDR values', () => {
    it('select bare host-prefix', () => {
      const data = {
        ...baseFormData,
        ...CIDRData,
      };
      const request = createClusterRequest({}, data);
      expectCIDR(request);
    });

    it('select host-prefix with a leading slash', () => {
      const data = {
        ...baseFormData,
        ...CIDRData,
        network_host_prefix: '/24',
      };
      const request = createClusterRequest({}, data);
      expectCIDR(request);
    });
  });

  // TODO: this can be removed, but some scenarios tested here e.g. gcpVPCData
  //   are worth moving to wizards tests?
  describe('CreateOSDForm', () => {
    // Form gets `product` prop affecting *initial* values for several fields notably
    // `billing_model` & `product`.  The final choice is in the field.
    // Form doesn't have `cloud_provider` field, gets it as prop.

    describe('OSD button -> GCP', () => {
      const params = { cloudProviderID: 'gcp' };

      it('rhInfra', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          byoc: 'false',
        };
        const request = createClusterRequest(params, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('gcp');
        expect(request.ccs).toBeUndefined();
      });

      it('select Free trial, CCS', () => {
        const data = {
          ...baseFormData,
          // 'standard-trial' is a fake value, a kludge for also initializing product;
          // the backend request only gets the part before '-'.
          billing_model: 'standard-trial',
          product: normalizedProducts.OSDTrial,
          byoc: 'true', // forced by OSDTrial.
          gcp_service_account: '{}',
          // CCS also lowers nodes_compute default, but not important for these tests.
          network_configuration_toggle: 'advanced',
          ...gcpVPCData,
          ...CIDRData,
        };
        const request = createClusterRequest(params, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osdtrial' });
        expect(request.cloud_provider.id).toEqual('gcp');
        expect(request.ccs.enabled).toEqual(true);
        expectGCPVPC(request);
        expectCIDR(request);
      });

      it('select On-demand (Marketplace) billing, CCS', () => {
        const data = {
          ...baseFormData,
          billing_model: 'marketplace',
          product: normalizedProducts.OSD,
          byoc: 'true', // forced by marketplace.
          gcp_service_account: '{}',
        };

        const request = createClusterRequest(params, data);
        expect(request.billing_model).toEqual('marketplace');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('gcp');
        expect(request.ccs.enabled).toEqual(true);
      });

      it('handles service account authentication type', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          cloud_provider: 'gcp',
          byoc: 'true',
          gcp_auth_type: GCPAuthType.ServiceAccounts,
          gcp_service_account: JSON.stringify(gcpServiceAccount),
          secure_boot: true,
        };

        const request = createClusterRequest({ isWizard: true }, data);
        expect(request.billing_model).toEqual(data.billing_model);
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual(data.cloud_provider);
        expect(request.ccs.enabled).toEqual(true);
        expect(request.gcp).toStrictEqual({
          ...pick(gcpServiceAccount, [
            'type',
            'project_id',
            'private_key_id',
            'private_key',
            'client_email',
            'client_id',
            'auth_uri',
            'token_uri',
            'auth_provider_x509_cert_url',
            'client_x509_cert_url',
          ]),
          security: {
            secure_boot: data.secure_boot,
          },
        });
      });

      it('handles workload identity federation (wif configs) authentication type', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          cloud_provider: 'gcp',
          byoc: 'true',
          gcp_auth_type: GCPAuthType.WorkloadIdentityFederation,
          gcp_wif_config: { id: '324ed23f2d12342d23d' },
          secure_boot: true,
        };

        const request = createClusterRequest({ isWizard: true }, data);
        expect(request.billing_model).toEqual(data.billing_model);
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual(data.cloud_provider);
        expect(request.ccs.enabled).toEqual(true);
        expect(request.gcp).toStrictEqual({
          authentication: {
            kind: 'WifConfig',
            id: data.gcp_wif_config.id,
          },
          security: {
            secure_boot: data.secure_boot,
          },
        });
      });
      it('handles Private Service Connection', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          cloud_provider: 'gcp',
          byoc: 'true',
          ...gcpVPCData,
          private_service_connect: true,
          psc_subnet: 'psc_subnet',
        };

        const request = createClusterRequest({ isWizard: true }, data);

        expect(request.cloud_provider.id).toEqual(data.cloud_provider);
        expect(request.ccs.enabled).toBeTruthy();
        expect(request.gcp.private_service_connect?.service_attachment_subnet).toEqual(
          'psc_subnet',
        );
      });
    });

    describe('OSD Trial button -> AWS', () => {
      const params = { cloudProviderID: 'aws' };

      it('CCS', () => {
        const data = {
          ...baseFormData,
          // 'standard-trial' is a fake value, a kludge for also initializing product;
          // the backend request only gets the part before '-'.
          billing_model: 'standard-trial',
          product: normalizedProducts.OSDTrial,
          byoc: 'true', // forced by OSDTrial.
          network_configuration_toggle: 'advanced',
          ...awsRosaOsdVPCData,
        };
        const request = createClusterRequest(params, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osdtrial' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs.enabled).toEqual(true);
        expectAWSVPC(request);
      });

      it('select Annual billing, rhInfra', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          byoc: 'false',
        };

        const request = createClusterRequest(params, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs).toBeUndefined();
      });

      it('select On-demand (Marketplace) billing, CCS', () => {
        const data = {
          ...baseFormData,
          billing_model: 'marketplace',
          product: normalizedProducts.OSD,
          byoc: 'true', // forced by marketplace.
        };

        const request = createClusterRequest(params, data);
        expect(request.billing_model).toEqual('marketplace');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs.enabled).toEqual(true);
      });
    });
  });

  describe('CreateOSDWizard', () => {
    // OSD wizard gets `product` prop affecting *initial* values for several fields notably
    // `billing_model` & `product`.  The final choice is in the field.
    // OSD wizard selects `cloud_provider` inside, it's a regular field.

    describe('OSD button', () => {
      it('rhInfra, AWS', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          byoc: 'false',
          cloud_provider: 'aws',
        };
        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs).toBeUndefined();
      });

      it('select Free trial, CCS, AWS', () => {
        const data = {
          ...baseFormData,
          // 'standard-trial' is a fake value, a kludge for also initializing product;
          // the backend request only gets the part before '-'.
          billing_model: 'standard-trial',
          product: normalizedProducts.OSDTrial,
          byoc: 'true', // forced by OSDTrial.
          // CCS also lowers nodes_compute default, but not important for these tests.
          cloud_provider: 'aws',
          ...awsRosaOsdVPCData,
          ...CIDRData,
        };
        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osdtrial' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs.enabled).toEqual(true);
        expectAWSVPC(request);
        expectCIDR(request);
      });

      it('select On-demand (Marketplace) billing, CCS, GCP', () => {
        const data = {
          ...baseFormData,
          billing_model: 'marketplace',
          product: normalizedProducts.OSD,
          byoc: 'true', // forced by marketplace.
          cloud_provider: 'gcp',
          gcp_service_account: '{}',
          ...gcpVPCData,
        };

        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('marketplace');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('gcp');
        expect(request.ccs.enabled).toEqual(true);
        expectGCPVPC(request);
      });

      it('does not include domain prefix if has_domain_prefix is false', () => {
        const data = {
          ...baseFormData,
          product: normalizedProducts.OSD,
          has_domain_prefix: false,
          domain_prefix: 'pre-test-1',
        };

        const request = createClusterRequest({}, data);

        expect(request.domain_prefix).toBeUndefined();
      });

      it('includes domain prefix if has_domain_prefix is true', () => {
        const data = {
          ...baseFormData,
          product: normalizedProducts.OSD,
          has_domain_prefix: true,
          domain_prefix: 'pre-test-1',
        };

        const request = createClusterRequest({}, data);

        expect(request.domain_prefix).toEqual('pre-test-1');
      });
    });

    describe('OSD Trial button', () => {
      it('CCS, GCP', () => {
        const data = {
          ...baseFormData,
          // 'standard-trial' is a fake value, a kludge for also initializing product;
          // the backend request only gets the part before '-'.
          billing_model: 'standard-trial',
          product: normalizedProducts.OSDTrial,
          byoc: 'true', // forced by OSDTrial
          cloud_provider: 'gcp',
          gcp_service_account: '{}',
        };
        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osdtrial' });
        expect(request.cloud_provider.id).toEqual('gcp');
        expect(request.ccs.enabled).toEqual(true);
      });

      it('select Annual billing, rhInfra, GCP', () => {
        const data = {
          ...baseFormData,
          billing_model: 'standard',
          product: normalizedProducts.OSD,
          byoc: 'false',
          cloud_provider: 'gcp',
        };
        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('gcp');
        expect(request.ccs).toBeUndefined();
      });

      it('select On-demand (Marketplace) billing, CCS, AWS', () => {
        const data = {
          ...baseFormData,
          billing_model: 'marketplace',
          product: normalizedProducts.OSD,
          byoc: 'true', // forced by marketplace.
          cloud_provider: 'aws',
        };

        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('marketplace');
        expect(request.product).toEqual({ id: 'osd' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs.enabled).toEqual(true);
      });
    });
  });

  describe('CreateROSAWizard', () => {
    describe('ROSA button', () => {
      const hcpSubnetDetails = {
        selected_vpc: awsRosaOsdVPCData,
        cluster_privacy_public_subnet_id: 'subnet-0703ec90283d1fd6b',
        machinePoolsSubnets: [
          {
            availabilityZone: '',
            privateSubnetId: 'subnet-00b3753ab2dd892ac',
            publicSubnetId: '',
          },
        ],
      };

      it('defaults', () => {
        const data = {
          ...rosaFormData,
          billing_model: 'standard',
          cloud_provider: 'aws',
          byoc: 'true',
          hypershift: 'false',
          ...CIDRData,
        };
        const request = createClusterRequest({}, data);
        expect(request.billing_model).toEqual('standard');
        expect(request.product).toEqual({ id: 'rosa' });
        expect(request.cloud_provider.id).toEqual('aws');
        expect(request.ccs.enabled).toEqual(true);
        expectCIDR(request);
      });

      it('sets billing_model to "marketplace-aws" for HCP cluster', () => {
        const data = {
          ...rosaFormData,
          billing_model: 'standard',
          cloud_provider: 'aws',
          byoc: 'true',
          hypershift: 'true',
          cluster_privacy: 'external',
          ...hcpSubnetDetails,
          ...CIDRData,
        };
        const request = createClusterRequest({}, data);

        expect(request.hypershift.enabled).toBeTruthy();
        expect(request.billing_model).toEqual('marketplace-aws');
      });

      it('leaves out node_drain_grace_period if Hypershift', () => {
        const data = {
          ...rosaFormData,
          hypershift: 'true',
          machinePoolsSubnets: [
            {
              availabilityZone: '',
              privateSubnetId: 'subnet-00b3753ab2dd892ac',
              publicSubnetId: '',
            },
          ],
        };
        const request = createClusterRequest({}, data);
        expect(request.node_drain_grace_period).toBeUndefined();
      });

      it('includes node_drain_grace_period if rosa classic', () => {
        const data = {
          ...rosaFormData,
          hypershift: 'false',
        };
        const request = createClusterRequest({}, data);
        expect(request.node_drain_grace_period).toEqual({ unit: 'minutes', value: 60 });
      });

      it('leaves out auto_mode if Hypershift', () => {
        const data = {
          ...rosaFormData,
          byoc: 'true',
          cloud_provider: 'aws',
          hypershift: 'true',
          rosa_roles_provider_creation_mode: 'auto',
          cluster_privacy: 'external',
          ...hcpSubnetDetails,
        };
        const request = createClusterRequest({}, data);
        expect(request.aws.sts.auto_mode).toBeUndefined();
      });

      it('includes auto_mode if is selected and byo_oidc_config_id_managed is false', () => {
        const data = {
          ...rosaFormData,
          byoc: 'true',
          cloud_provider: 'aws',
          rosa_roles_provider_creation_mode: 'auto',
          byo_oidc_config_id_managed: 'false',
        };
        const request = createClusterRequest({}, data);
        expect(request.aws.sts.auto_mode).toBeTruthy();
      });

      it.each([
        ['external', ['subnet-0703ec90283d1fd6b', 'subnet-00b3753ab2dd892ac']],
        ['internal', ['subnet-00b3753ab2dd892ac']],
      ])(
        'creates the subnet and availability zone fields correctly for privacy=%p clusters',
        (clusterPrivacy, expectedSubnetIds) => {
          const data = {
            ...rosaFormData,
            cloud_provider: 'aws',
            byoc: 'true',
            hypershift: 'true',
            multi_az: 'false',
            cluster_privacy: clusterPrivacy,
            ...hcpSubnetDetails,
          };
          const request = createClusterRequest({}, data);
          expect(request.aws.subnet_ids).toEqual(expectedSubnetIds);
        },
      );

      it('does not include domain prefix if has_domain_prefix is false', () => {
        const data = {
          ...rosaFormData,
          cloud_provider: 'aws',
          has_domain_prefix: false,
          domain_prefix: 'pre-test-1',
        };
        const request = createClusterRequest({}, data);

        expect(request.domain_prefix).toBeUndefined();
      });

      it('includes domain prefix if has_domain_prefix is true', () => {
        const data = {
          ...rosaFormData,
          cloud_provider: 'aws',
          has_domain_prefix: true,
          domain_prefix: 'pre-test-1',
        };
        const request = createClusterRequest({}, data);

        expect(request.domain_prefix).toEqual('pre-test-1');
      });

      describe('AWS Security Groups', () => {
        const byoVpcData = {
          ...rosaFormData,
          cloud_provider: 'aws',
          byoc: 'true',
          install_to_vpc: true,
          shared_vpc: { is_selected: false },
          multi_az: 'false',
          machinePoolsSubnets: [
            {
              availabilityZone: 'us-east-1d',
              privateSubnetId: 'subnet-00b3753ab2dd892ac',
              publicSubnetId: 'subnet-0703ec90283d1fd6b',
            },
          ],
        };

        it('are not sent if no groups have been selected', () => {
          const request = createClusterRequest({}, byoVpcData);

          expect(request.aws.additional_control_plane_security_group_ids).toBeUndefined();
          expect(request.aws.additional_infra_security_group_ids).toBeUndefined();
          expect(request.aws.additional_compute_security_group_ids).toBeUndefined();
        });

        describe('when applyControlPlaneToAll', () => {
          const getTestData = ({ applyControlPlaneToAll }) => ({
            ...byoVpcData,
            securityGroups: {
              applyControlPlaneToAll,
              controlPlane: ['sg-cp'],
              infra: ['sg-infra1', 'sg-infra2'],
              worker: [],
            },
          });

          it('is false, each node type uses its own groups', () => {
            const request = createClusterRequest(
              {},
              getTestData({ applyControlPlaneToAll: false }),
            );

            expect(request.aws.additional_control_plane_security_group_ids).toEqual(['sg-cp']);
            expect(request.aws.additional_infra_security_group_ids).toEqual([
              'sg-infra1',
              'sg-infra2',
            ]);
            expect(request.aws.additional_compute_security_group_ids).toBeUndefined();
          });

          it('is true, the control plane security groups are used for all node types', () => {
            const request = createClusterRequest({}, getTestData({ applyControlPlaneToAll: true }));

            expect(request.aws.additional_control_plane_security_group_ids).toEqual(['sg-cp']);
            expect(request.aws.additional_infra_security_group_ids).toEqual(['sg-cp']);
            expect(request.aws.additional_compute_security_group_ids).toEqual(['sg-cp']);
          });
        });
      });
    });
    describe('Compute nodes', () => {
      it('are calculated correctly for hypershift', () => {
        const data = {
          ...rosaFormData,
          hypershift: 'true',
          nodes_compute: '2',
          machinePoolsSubnets: [{}, {}],
        };
        const request = createClusterRequest({}, data);
        expect(request.nodes.compute).toEqual(4);
      });

      it('are calculated correctly for rosa classic, multi-AZ', () => {
        const data = {
          ...rosaFormData,
          hypershift: 'false',
          multi_az: 'true',
          nodes_compute: '2',
        };
        const request = createClusterRequest({}, data);
        expect(request.nodes.compute).toEqual(6);
      });

      it('are calculated correctly for rosa classic, single-AZ', () => {
        const data = {
          ...rosaFormData,
          hypershift: 'false',
          multi_az: 'false',
          nodes_compute: '2',
        };
        const request = createClusterRequest({}, data);
        expect(request.nodes.compute).toEqual(2);
      });
    });
  });
});
