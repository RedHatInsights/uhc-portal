import * as React from 'react';
import { Formik } from 'formik';

import { initialValues } from '~/components/clusters/wizards/rosa/constants';
import NetworkScreen from '~/components/clusters/wizards/rosa/NetworkScreen/NetworkScreen';
import { mockRestrictedEnv, render, screen } from '~/testUtils';

const testValues = {
  cloud_provider: 'aws',
  configure_proxy: false,
  product: 'ROSA',
  cluster_privacy: 'internal',
  cluster_version: {
    kind: 'Version',
    id: 'openshift-v4.14.10',
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.14.10',
    raw_id: '4.14.10',
    enabled: true,
    default: true,
    channel_group: 'stable',
    rosa_enabled: true,
    hosted_control_plane_enabled: true,
    hosted_control_plane_default: true,
    end_of_life_timestamp: '2025-02-28T00:00:00Z',
    image_overrides: {},
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:03cc63c0c48b2416889e9ee53f2efc2c940323c15f08384b439c00de8e66e8aa',
  },
  applicationIngress: 'default',
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
  install_to_vpc: false,
  shared_vpc: {
    is_allowed: true,
    is_selected: false,
    base_dns_domain: '',
    hosted_zone_id: '',
    hosted_zone_role_arn: '',
  },
  selected_vpc: {
    id: '',
    name: '',
  },
};

const buildTestComponent = (children: React.ReactNode, formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...testValues,
      ...formValues,
    }}
    onSubmit={() => {}}
  >
    {children}
  </Formik>
);

describe('<NetworkScreen />', () => {
  describe('in Restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });
    it('Cluster privacy is set to internal and cannot be changed', async () => {
      const { rerender } = render(buildTestComponent(<NetworkScreen showClusterPrivacy />));

      expect(await screen.findByTestId('cluster_privacy-external')).toBeInTheDocument();
      expect(screen.getByTestId('cluster_privacy-external')).not.toBeDisabled();
      expect(screen.getByTestId('cluster_privacy-internal')).not.toBeDisabled();

      isRestrictedEnv.mockReturnValue(true);
      rerender(buildTestComponent(<NetworkScreen showClusterPrivacy />));

      expect(await screen.findByTestId('cluster_privacy-external')).toBeInTheDocument();
      expect(screen.getByTestId('cluster_privacy-external')).toBeDisabled();
      expect(screen.getByTestId('cluster_privacy-external')).not.toBeChecked();
      expect(screen.getByTestId('cluster_privacy-internal')).toBeChecked();
      expect(screen.getByTestId('cluster_privacy-internal')).toBeDisabled();
    });
    it('Cluster privacy is set to internal and only private is visible for HCP', async () => {
      const { rerender } = render(
        buildTestComponent(<NetworkScreen showClusterPrivacy />, { hypershift: 'true' }),
      );

      expect(await screen.findByTestId('cluster_privacy-external')).toBeInTheDocument();
      expect(screen.getByTestId('cluster_privacy-external')).not.toBeDisabled();
      expect(screen.getByTestId('cluster_privacy-internal')).not.toBeDisabled();

      isRestrictedEnv.mockReturnValue(true);
      rerender(buildTestComponent(<NetworkScreen showClusterPrivacy />));

      expect(screen.queryByTestId('cluster_privacy-external')).toBeNull();
      expect(screen.getByTestId('cluster_privacy-internal')).toBeChecked();
      expect(screen.getByTestId('cluster_privacy-internal')).toBeDisabled();
    });
  });
});
