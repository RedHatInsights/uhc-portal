import React from 'react';
import { Formik, FormikValues } from 'formik';

import { GCP_DNS_ZONE } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { FieldId, initialValues } from '../../constants';
import { ClusterPrivacyType } from '../constants';

import { GcpVpcSettings } from './GcpVpcSettings';

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
  });
});
