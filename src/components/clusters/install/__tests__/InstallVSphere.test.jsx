import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { version } from '../InstallTestConstants';
import InstallVSphere from '../InstallVSphere';

describe('<InstallVSphere />', () => {
  it('is accessible', async () => {
    const { container } = render(<InstallVSphere />);

    expect(screen.getByText('Create an OpenShift Cluster: VMware vSphere')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('displays expected doc links', () => {
    render(<InstallVSphere />);

    expect(screen.getByRole('link', { name: /Learn more about interactive/ })).toHaveAttribute(
      'href',
      `https://docs.redhat.com/en/documentation/openshift_container_platform/${version}/html/installing_on-premise_with_assisted_installer/installing-on-prem-assisted`,
    );

    expect(
      screen.getByRole('link', { name: /Learn more about local agent-based/ }),
    ).toHaveAttribute(
      'href',
      `https://docs.redhat.com/en/documentation/openshift_container_platform/${version}/html/installing_an_on-premise_cluster_with_the_agent-based_installer/preparing-to-install-with-agent-based-installer`,
    );

    expect(screen.getByRole('link', { name: /Learn more about automated/ })).toHaveAttribute(
      'href',
      `https://docs.redhat.com/en/documentation/openshift_container_platform/${version}/html/installing_on_vmware_vsphere/installer-provisioned-infrastructure#installing-vsphere-installer-provisioned`,
    );

    expect(screen.getByRole('link', { name: /Learn more about full control/ })).toHaveAttribute(
      'href',
      `https://docs.redhat.com/en/documentation/openshift_container_platform/${version}/html/installing_on_vmware_vsphere/user-provisioned-infrastructure#installing-vsphere`,
    );
  });
});
