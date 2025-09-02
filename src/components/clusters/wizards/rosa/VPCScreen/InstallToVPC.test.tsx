import React, { ReactNode } from 'react';
import { Formik } from 'formik';

import links from '~/common/installLinks.mjs';
import { InstallToVPC } from '~/components/clusters/wizards/rosa/VPCScreen/InstallToVPC';
import { render, screen } from '~/testUtils';

import { initialValues } from '../constants';

const defaultProps = {
  selectedRegion: 'us-east-1',
  isMultiAz: false,
  privateLinkSelected: false,
  cloudProviderID: 'aws',
  isSharedVpcSelected: false,
  hostedZoneDomainName: 'cluster-name.base-domain-name.devshift.org',
  selectedVPC: { id: '', name: '' },
  selectedAZs: [],
  openshiftVersion: '1.0.0',
};

const buildTestComponent = (children: ReactNode, formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
      securityGroups: {
        applyControlPlaneToAll: true,
        controlPlane: [],
        infra: [],
        worker: [],
      },
    }}
    onSubmit={() => {}}
  >
    {children}
  </Formik>
);

describe('<InstallToVPC> (AWS)', () => {
  it.each([[false], [true]])('should have a Shared VPC section', async (isHypershift) => {
    render(
      buildTestComponent(<InstallToVPC {...defaultProps} isHypershiftSelected={isHypershift} />),
    );

    expect(await screen.findByText('AWS shared VPC')).toBeInTheDocument();
  });

  it.each([[false], [true]])('should show a link to AWS VPC requirements', async (isHypershift) => {
    render(
      buildTestComponent(<InstallToVPC {...defaultProps} isHypershiftSelected={isHypershift} />),
    );

    expect(await screen.findByRole('link', { name: /Learn more about VPC/ })).toHaveAttribute(
      'href',
      links.INSTALL_AWS_CUSTOM_VPC_REQUIREMENTS,
    );
  });
});
