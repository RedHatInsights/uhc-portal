import React from 'react';
import { Formik, FormikValues } from 'formik';

import { GCP_BYO_FIREWALL_RULES, GCP_DNS_ZONE } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { FieldId, initialValues } from '../../constants';
import { ClusterPrivacyType } from '../constants';

import { GcpVpcSettings } from './GcpVpcSettings';

jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRules', () => ({
  useFetchGcpFirewallRules: jest.fn(() => ({
    data: [],
    isFetching: false,
    isSuccess: true,
  })),
  refetchGcpFirewallRules: jest.fn(),
}));

const prepareComponent = (customValues?: FormikValues) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...customValues,
    }}
    onSubmit={() => {}}
  >
    {(props) => (
      <>
        <GcpVpcSettings />
        <button type="submit" onClick={() => props.handleSubmit()}>
          Submit
        </button>
      </>
    )}
  </Formik>
);

describe('<GcpVpcSettings />', () => {
  describe('<GcpVpcSettings /> with Private Cluster and Private Service Connect', () => {
    // - The component renders correctly with all its fields.
    it('renders correctly with default fields', () => {
      render(prepareComponent());
      expect(screen.queryByText('Existing VPC name')).toBeInTheDocument();
      expect(screen.queryByText('Control plane subnet name')).toBeInTheDocument();
      expect(screen.queryByText('Compute subnet name')).toBeInTheDocument();
    });

    it('do not render PSC with all default fields', () => {
      render(prepareComponent());
      expect(screen.queryByText('Existing VPC name')).toBeInTheDocument();
      expect(screen.queryByText('Control plane subnet name')).toBeInTheDocument();
      expect(screen.queryByText('Compute subnet name')).toBeInTheDocument();
      expect(screen.queryByText('Private Service Connect subnet name')).not.toBeInTheDocument();
    });

    it('renders Private service connect subnet option when PSC is enabled', () => {
      render(
        prepareComponent({
          [FieldId.PrivateServiceConnect]: true,
          [FieldId.InstallToSharedVpc]: true,
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
        }),
      );

      expect(screen.queryByText('Private Service Connect subnet name')).toBeInTheDocument();
    });

    it('renders DNS Zone when hasDomainPrefix true', () => {
      mockUseFeatureGate([[GCP_DNS_ZONE, true]]);
      render(
        prepareComponent({
          [FieldId.InstallToSharedVpc]: true,
          [FieldId.HasDomainPrefix]: true,
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
        }),
      );

      expect(screen.getByText('DNS Zone')).toBeInTheDocument();
      expect(screen.getByText('Create DNS Zone')).toBeInTheDocument();
    });

    it('renders DNS zone alert when no domain prefix exists', async () => {
      mockUseFeatureGate([[GCP_DNS_ZONE, true]]);
      render(
        prepareComponent({
          [FieldId.InstallToSharedVpc]: true,
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
        }),
      );

      expect(screen.getByText('DNS Zone')).toBeInTheDocument();
      expect(screen.getByText('Domain prefix required')).toBeInTheDocument();
    });

    it('renders Firewall Rules when feature gate and version requirements are met', () => {
      mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, true]]);
      render(
        prepareComponent({
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
          [FieldId.ClusterVersion]: { raw_id: '4.21.0' },
          [FieldId.GcpWifConfig]: { id: 'wif-1', gcp: { project_id: 'project-1' } },
        }),
      );

      expect(screen.getByText('Firewall Rules')).toBeInTheDocument();
      expect(screen.getByText('Create Firewall Rules')).toBeInTheDocument();
    });

    it('hides Firewall Rules when OpenShift version is below 4.21', () => {
      mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, true]]);
      render(
        prepareComponent({
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
          [FieldId.ClusterVersion]: { raw_id: '4.20.0' },
          [FieldId.GcpWifConfig]: { id: 'wif-1', gcp: { project_id: 'project-1' } },
        }),
      );

      expect(screen.queryByText('Firewall Rules')).not.toBeInTheDocument();
    });

    it('hides Firewall Rules when the feature gate is disabled', () => {
      mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, false]]);
      render(
        prepareComponent({
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
          [FieldId.ClusterVersion]: { raw_id: '4.21.0' },
          [FieldId.GcpWifConfig]: { id: 'wif-1', gcp: { project_id: 'project-1' } },
        }),
      );

      expect(screen.queryByText('Firewall Rules')).not.toBeInTheDocument();
    });

    it('pre-populates the CLI with WIF project and public profile for non-shared VPC', async () => {
      mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, true]]);
      const { user } = render(
        prepareComponent({
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
          [FieldId.ClusterVersion]: { raw_id: '4.21.0' },
          [FieldId.GcpWifConfig]: { id: 'wif-1', gcp: { project_id: 'wif-project' } },
          [FieldId.VpcName]: 'prod-vpc',
        }),
      );

      await user.click(screen.getByText('Create Firewall Rules'));

      const cliValue = (
        screen.getByLabelText('Copyable create firewall rules command') as HTMLInputElement
      ).value;
      expect(cliValue).toContain('--wif-config=wif-1');
      expect(cliValue).toContain('--project=wif-project');
      expect(cliValue).not.toContain('--profile=private');
    });

    it('pre-populates the CLI with host project and private profile for Shared VPC with PSC', async () => {
      mockUseFeatureGate([[GCP_BYO_FIREWALL_RULES, true]]);
      const { user } = render(
        prepareComponent({
          [FieldId.Byoc]: 'true',
          [FieldId.GcpAuthType]: 'workloadIdentityFederation',
          [FieldId.ClusterVersion]: { raw_id: '4.21.0' },
          [FieldId.GcpWifConfig]: { id: 'wif-1', gcp: { project_id: 'wif-project' } },
          [FieldId.InstallToSharedVpc]: true,
          [FieldId.SharedHostProjectID]: 'host-project',
          [FieldId.VpcName]: 'shared-vpc',
          [FieldId.PrivateServiceConnect]: true,
          [FieldId.ClusterPrivacy]: ClusterPrivacyType.Internal,
        }),
      );

      await user.click(screen.getByText('Create Firewall Rules'));

      expect(
        screen.getByDisplayValue(
          'ocm gcp create firewall-rules --name=<name> --wif-config=wif-1 --project=host-project --network=shared-vpc --profile=private',
        ),
      ).toBeInTheDocument();
    });
  });
});
