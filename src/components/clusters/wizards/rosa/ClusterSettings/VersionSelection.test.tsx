import React from 'react';
import { Formik } from 'formik';

import * as helpers from '~/common/helpers';
import * as ReleaseHooks from '~/components/releases/hooks';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { clustersActions } from '~/redux/actions/clustersActions';
import type { GlobalState } from '~/redux/state';
import {
  checkAccessibility,
  mockUseFeatureGate,
  screen,
  waitFor,
  within,
  withState,
} from '~/testUtils';
import { ProductLifeCycle } from '~/types/product-life-cycles';

import { FieldId } from '../constants';

import VersionSelection from './VersionSelection';
import { mockOCPLifeCycleStatusData } from './VersionSelection.fixtures';

jest.mock('~/redux/actions/clustersActions');
const useOCPLifeCycleStatusDataSpy = jest.spyOn(ReleaseHooks, 'useOCPLifeCycleStatusData');

const mockGetInstallableVersions = clustersActions.getInstallableVersions as jest.Mock;

const componentText = {
  SELECT_TOGGLE: { label: 'Options menu' }, // PF Select's default toggleAriaLabel.
};

const versions = [
  {
    ami_overrides: [],
    channel_group: 'stable',
    default: false,
    enabled: true,
    end_of_life_timestamp: '2024-03-17T00:00:00Z',
    hosted_control_plane_enabled: true,
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.1',
    id: 'openshift-v4.12.1',
    kind: 'Version',
    raw_id: '4.12.1',
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:b9d6ccb5ba5a878141e468e56fa62912ad7c04864acfec0c0056d2b41e3259cc',
    rosa_enabled: true,
  },
  {
    ami_overrides: [],
    channel_group: 'stable',
    default: false,
    enabled: true,
    end_of_life_timestamp: '2024-03-17T00:00:00Z',
    hosted_control_plane_enabled: true,
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.11.4',
    id: 'openshift-v4.11.4',
    kind: 'Version',
    raw_id: '4.11.4',
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:b9d6ccb5ba5a878141e468e56fa62912ad7c04864acfec0c0056d2b41e3259cc',
    rosa_enabled: true,
  },
  {
    ami_overrides: [],
    channel_group: 'stable',
    default: false,
    enabled: true,
    end_of_life_timestamp: '2024-03-17T00:00:00Z',
    hosted_control_plane_enabled: true,
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.11.3',
    id: 'openshift-v4.11.3',
    kind: 'Version',
    raw_id: '4.11.3',
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:b9d6ccb5ba5a878141e468e56fa62912ad7c04864acfec0c0056d2b41e3259cc',
    rosa_enabled: true,
  },
  {
    ami_overrides: [],
    channel_group: 'stable',
    default: false,
    enabled: true,
    end_of_life_timestamp: '2024-03-17T00:00:00Z',
    hosted_control_plane_enabled: true,
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.10.1',
    id: 'openshift-v4.10.1',
    kind: 'Version',
    raw_id: '4.10.1',
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:b9d6ccb5ba5a878141e468e56fa62912ad7c04864acfec0c0056d2b41e3259cc',
    rosa_enabled: true,
  },
];
const unstableVersions = [
  {
    ami_overrides: [],
    channel_group: 'fast',
    default: false,
    enabled: true,
    end_of_life_timestamp: '2024-03-17T00:00:00Z',
    hosted_control_plane_enabled: true,
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.11.5',
    id: 'openshift-v4.11.5-fast',
    kind: 'Version',
    raw_id: '4.11.5',
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:b9d6ccb5ba5a878141e468e56fa62912ad7c04864acfec0c0056d2b41e3259cc',
    rosa_enabled: true,
  },
  {
    ami_overrides: [],
    channel_group: 'candidate',
    default: false,
    enabled: true,
    end_of_life_timestamp: '2024-03-17T00:00:00Z',
    hosted_control_plane_enabled: true,
    href: '/api/clusters_mgmt/v1/versions/openshift-v4.11.5',
    id: 'openshift-v4.11.5-candidate',
    kind: 'Version',
    raw_id: '4.11.5',
    release_image:
      'quay.io/openshift-release-dev/ocp-release@sha256:b9d6ccb5ba5a878141e468e56fa62912ad7c04864acfec0c0056d2b41e3259cc',
    rosa_enabled: true,
  },
];

const noVersionsState: GlobalState['clusters']['clusterVersions'] = {
  error: false,
  pending: false,
  fulfilled: false,
  versions: [],
};
const pendingVersionsState: GlobalState['clusters']['clusterVersions'] = {
  error: false,
  pending: true,
  fulfilled: false,
  versions: [],
};
const errorState: GlobalState['clusters']['clusterVersions'] = {
  error: true,
  errorMessage: 'This is a custom error message',
  pending: false,
  fulfilled: false,
  versions: [],
};
const fulfilledVersionsState: GlobalState['clusters']['clusterVersions'] = {
  error: false,
  pending: false,
  fulfilled: true,
  params: {},
  versions,
};
const fulfilledAllVersionsState: GlobalState['clusters']['clusterVersions'] = {
  error: false,
  pending: false,
  fulfilled: true,
  params: {},
  versions: [...versions, ...unstableVersions],
};

const managedARNsState: GlobalState['rosaReducer']['getAWSAccountRolesARNsResponse'] = {
  fulfilled: true,
  error: false,
  pending: false,
  data: [
    {
      prefix: 'myManagedRoles',
      managedPolicies: true,
      hcpManagedPolicies: true,
      isAdmin: true,
      version: '4.13.0',
      Installer: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
      Support: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Support-Role',
      Worker: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Worker-Role',
    },
  ],
};
const managedARNsFields = {
  [FieldId.InstallerRoleArn]:
    'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
  [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Support-Role',
  [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Worker-Role',
};

const defaultFields = {
  [FieldId.ClusterVersion]: undefined,
  [FieldId.Hypershift]: 'false',
  [FieldId.RosaMaxOsVersion]: '4.12',
  [FieldId.InstallerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Installer-Role',
  [FieldId.SupportRoleArn]: 'arn:aws:iam::123456789:role/Foo-Support-Role',
  [FieldId.WorkerRoleArn]: 'arn:aws:iam::123456789:role/Foo-Worker-Role',
};

const onChangeMock = jest.fn();
const defaultProps = {
  onChange: onChangeMock,
  label: 'Version select label',
};

describe('<VersionSelection />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useOCPLifeCycleStatusDataSpy.mockReturnValue(
      mockOCPLifeCycleStatusData as [ProductLifeCycle[] | undefined, boolean],
    );

    // Shortcut: prevent request made after mount from modifying state.
    //   Makes it easier to test request lifecycle, especially errors,
    //   by preparing redux state before mount.
    //   (We have separate tests here asserting the request is made / not made)
    mockGetInstallableVersions.mockReturnValue({ type: 'NOP' });
  });

  it('is accessible when open', async () => {
    // Arrange
    const state = { clusters: { clusterVersions: fulfilledVersionsState } };
    const { container } = withState(state).render(
      <Formik onSubmit={() => {}} initialValues={defaultFields}>
        <VersionSelection {...defaultProps} />
      </Formik>,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('is accessible when closed', async () => {
    // Arrange
    const state = { clusters: { clusterVersions: fulfilledVersionsState } };
    const newProps = {
      ...defaultProps,
    };
    const { container } = withState(state).render(
      <Formik onSubmit={() => {}} initialValues={defaultFields}>
        <VersionSelection {...newProps} />
      </Formik>,
    );

    // Assert
    await checkAccessibility(container);
  });

  describe('calls getInstallableVersions', () => {
    it('is not called when it has already called and control plane has not changed', async () => {
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(0);
      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, params: { product: 'hcp' } } },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(0);
    });

    it('when getInstallableVersions on mount has not been called before', async () => {
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(0);
      const state = { clusters: { clusterVersions: noVersionsState } };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(1);
    });

    it('on mount when last call ended in error', async () => {
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(0);
      const state = { clusters: { clusterVersions: errorState } };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(1);
    });

    it('on mount if control plane switched from HCP to Classic', async () => {
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(0);

      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, params: { product: 'hcp' } } },
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(1);
    });

    it('on mount if control plane switched from Classic to HCP', async () => {
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(0);
      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, params: {} } },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(mockGetInstallableVersions.mock.calls).toHaveLength(1);
    });
  });

  describe('when Hypershift', () => {
    it('hides versions prior to "4.11.4" when hypershift and an ARN with a managed policy are selected', async () => {
      // Arrange
      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, params: { product: 'hcp' } } },
        rosaReducer: { getAWSAccountRolesARNsResponse: managedARNsState },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
        ...managedARNsFields,
      };

      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      // Open the dropdown
      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.12.1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.11.4' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.11.3' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.10.1' })).not.toBeInTheDocument();
    });

    it('shows versions prior to "4.11.4" when hypershift and no ARNs with managed policies are selected', async () => {
      // Arrange
      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, params: { product: 'hcp' } } },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );
      // Open the dropdown
      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      versions.forEach((version) => {
        expect(screen.getByRole('option', { name: version.raw_id })).toBeInTheDocument();
      });
    });

    it('Selects latest version when it is both rosa and hypershift enabled', async () => {
      const newVersions = [...versions];

      const latestVersion = {
        ...versions[0],
        raw_id: '4.12.99',
        id: 'openshift-v4.12.99',
        default: false,
        enabled: true,
        rosa_enabled: true,
        hosted_control_plane_enabled: true,
      };

      newVersions.unshift(latestVersion);

      const state = {
        clusters: {
          clusterVersions: {
            ...fulfilledVersionsState,
            params: { product: 'hcp' },
            versions: newVersions,
          },
        },
      };
      const newProps = {
        ...defaultProps,
        onChange: onChangeMock,
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      // onChange is called on render to set the default version
      expect(onChangeMock).toHaveBeenCalled();
      expect(onChangeMock).toHaveBeenCalledWith(latestVersion);
    });

    it('Selects version that is hypershift enabled when the latest is not hypershift enabled', async () => {
      const newVersions = [...versions];

      const latestVersion = {
        ...versions[0],
        raw_id: '4.12.99',
        id: 'openshift-v4.12.99',
        default: false,
        enabled: true,
        rosa_enabled: true,
        hosted_control_plane_enabled: false,
      };

      newVersions.unshift(latestVersion);

      const state = {
        clusters: {
          clusterVersions: {
            ...fulfilledVersionsState,
            params: { product: 'hcp' },
            versions: newVersions,
          },
        },
      };
      const newProps = {
        ...defaultProps,
        onChange: onChangeMock,
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      // onChange is called on render to set the default version
      expect(onChangeMock).toHaveBeenCalled();

      expect(newVersions[1].rosa_enabled).toBeTruthy();
      expect(newVersions[1].hosted_control_plane_enabled).toBeTruthy();
      expect(onChangeMock).not.toHaveBeenCalledWith(latestVersion);
      expect(onChangeMock).toHaveBeenCalledWith(newVersions[1]);
    });

    it('Selects version that is hypershift enabled when the latest is neither hypershift nor rosa enabled', async () => {
      const newVersions = [...versions];

      const latestVersion = {
        ...versions[0],
        raw_id: '4.12.99',
        id: 'openshift-v4.12.99',
        default: false,
        enabled: true,
        rosa_enabled: false,
        hosted_control_plane_enabled: false,
      };

      newVersions.unshift(latestVersion);

      const state = {
        clusters: {
          clusterVersions: {
            ...fulfilledVersionsState,
            params: { product: 'hcp' },
            versions: newVersions,
          },
        },
      };
      const newProps = {
        ...defaultProps,
        onChange: onChangeMock,
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      // onChange is called on render to set the default version
      expect(onChangeMock).toHaveBeenCalled();

      expect(newVersions[1].rosa_enabled).toBeTruthy();
      expect(newVersions[1].hosted_control_plane_enabled).toBeTruthy();
      expect(onChangeMock).not.toHaveBeenCalledWith(latestVersion);
      expect(onChangeMock).toHaveBeenCalledWith(newVersions[1]);
    });
    it('shows all versions when hypershift regardless of ARN maxOS version settings', async () => {
      const newVersions = [
        {
          ami_overrides: [],
          channel_group: 'stable',
          default: false,
          enabled: true,
          end_of_life_timestamp: '2025-03-17T00:00:00Z',
          hosted_control_plane_enabled: true,
          href: '/api/clusters_mgmt/v1/versions/openshift-v4.18.1',
          id: 'openshift-v4.18.1',
          kind: 'Version',
          raw_id: '4.18.1',
          release_image: 'quay.io/openshift-release-dev/ocp-release@sha256:mock1234',
          rosa_enabled: true,
        },
        ...versions,
      ];
      const fulfilledUpdatedVersionsState: GlobalState['clusters']['clusterVersions'] = {
        error: false,
        pending: false,
        fulfilled: true,
        params: {},
        versions: newVersions,
      };
      // Arrange
      const state = {
        clusters: {
          clusterVersions: { ...fulfilledUpdatedVersionsState, params: { product: 'hcp' } },
        },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.16',
        [FieldId.Hypershift]: 'true',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      newVersions.forEach((version) => {
        expect(screen.getByRole('option', { name: version.raw_id })).toBeInTheDocument();
      });
    });
  });

  describe('all clusters', () => {
    let mockedSupportedVersion: jest.SpyInstance<
      boolean,
      [version: string, maxMinorVersion: string]
    >;
    beforeEach(() => {
      mockedSupportedVersion = jest.spyOn(helpers, 'isSupportedMinorVersion');
    });
    afterEach(() => {
      mockedSupportedVersion.mockRestore();
    });

    it('displays only error when error getting versions', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: errorState } };
      const { container } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(
        within(screen.getByTestId('alert-error')).getByText(/Error getting cluster versions/),
      ).toBeInTheDocument();
      expect(screen.getByText('This is a custom error message')).toBeInTheDocument();
      expect(screen.queryByLabelText(componentText.SELECT_TOGGLE.label)).not.toBeInTheDocument();
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();

      await checkAccessibility(container);
    });

    it('displays only error when a default ROSA version is not found', async () => {
      // Arrange
      mockedSupportedVersion.mockImplementation(() => false);
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      // Assert
      expect(
        within(screen.getByRole('alert')).getByText(
          /There is no version compatible with the selected ARNs in previous step/,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(componentText.SELECT_TOGGLE.label)).not.toBeInTheDocument();
    });

    it('displays only spinner while retrieving versions', () => {
      // Arrange
      const state = { clusters: { clusterVersions: pendingVersionsState } };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
      expect(screen.queryByLabelText(componentText.SELECT_TOGGLE.label)).not.toBeInTheDocument();
    });

    it('displays View compatible versions switch if there are incompatible versions', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.11.3',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.getByLabelText('View only compatible versions')).toBeInTheDocument();
    });

    it('hides View compatible switch if there are no incompatible versions', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.12.1',
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.queryByLabelText('View only compatible versions')).not.toBeInTheDocument();
    });

    it('toggling View compatible switch hides/shows compatible versions', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.11.3',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(screen.getByLabelText('View only compatible versions')).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.12.1' })).not.toBeInTheDocument();

      // Act
      await user.click(screen.getByLabelText('View only compatible versions'));

      // Assert
      expect(
        screen.getByRole('option', {
          name: '4.12.1 This version is not compatible with the selected ARNs in previous step',
        }),
      ).toBeInTheDocument();

      // Act
      await user.click(screen.getByLabelText('View only compatible versions'));

      // Assert
      expect(screen.queryByRole('option', { name: '4.12.1' })).not.toBeInTheDocument();
    });

    it('shows full support versions grouped together', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.getAllByRole('listbox')).toHaveLength(2);

      // Assert
      const fullSupportList = screen.getAllByRole('listbox')[0];
      expect(within(fullSupportList).getAllByRole('option')).toHaveLength(1);
      expect(within(fullSupportList).getByRole('option', { name: '4.12.1' })).toBeInTheDocument();
    });

    it('shows maintenance support versions grouped together', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.getAllByRole('listbox')).toHaveLength(2);

      // Assert
      const maintenanceSupportList = screen.getAllByRole('listbox')[1];
      expect(within(maintenanceSupportList).getAllByRole('option')).toHaveLength(3);

      expect(
        within(maintenanceSupportList).getByRole('option', { name: '4.11.4' }),
      ).toBeInTheDocument();
      expect(
        within(maintenanceSupportList).getByRole('option', { name: '4.11.3' }),
      ).toBeInTheDocument();
      expect(
        within(maintenanceSupportList).getByRole('option', { name: '4.10.1' }),
      ).toBeInTheDocument();
    });

    it('Check for preselected version', async () => {
      // Arrange
      const version = '4.11.3';
      const selectedClusterVersion = versions.find((v) => v.raw_id === version);
      expect(selectedClusterVersion).not.toBeUndefined();

      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newProps = {
        ...defaultProps,
      };
      const newFields = {
        ...defaultFields,
        [FieldId.ClusterVersion]: selectedClusterVersion,
      };

      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      // Assert
      expect(screen.getByText(version)).toBeInTheDocument();

      // Act
      await user.click(
        screen.getByRole('button', {
          name: componentText.SELECT_TOGGLE.label,
        }),
      );

      // Assert
      expect(screen.getAllByRole('option', { selected: true })).toHaveLength(1);
      expect(screen.getByRole('option', { selected: true, name: version })).toBeInTheDocument();
    });

    it('Selects the latest version if it is rosa enabled', async () => {
      const newVersions = [...versions];

      const latestVersion = {
        ...versions[0],
        raw_id: '4.12.99',
        id: 'openshift-v4.12.99',
        default: false,
        enabled: true,
        rosa_enabled: true,
        hosted_control_plane_enabled: false,
      };

      newVersions.unshift(latestVersion);

      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, versions: newVersions } },
      };
      const newProps = {
        ...defaultProps,
        input: { onChange: onChangeMock },
      };
      const newFields = {
        ...defaultFields,
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      // onChange is called on render to set the default version
      expect(onChangeMock).toHaveBeenCalled();
      expect(onChangeMock).toHaveBeenCalledWith(latestVersion);
    });

    it('parses displays and selects version 4.20.0 if it is latest version', async () => {
      const newVersions = [...versions];

      const latestVersion = {
        ...versions[0],
        raw_id: '4.20.0',
        id: 'openshift-v4.20.0',
        default: false,
        enabled: true,
        rosa_enabled: true,
        hosted_control_plane_enabled: true,
      };

      newVersions.unshift(latestVersion);

      const state = {
        clusters: { clusterVersions: { ...fulfilledAllVersionsState, versions: newVersions } },
      };
      const newProps = {
        ...defaultProps,
        input: { onChange: onChangeMock },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.20.0',
      };

      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.2' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.2.0' })).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.20.0' })).toBeInTheDocument();
      // onChange is called on render to set the default version
      expect(onChangeMock).toHaveBeenCalled();
      expect(onChangeMock).toHaveBeenCalledWith(latestVersion);
    });

    it('Selects the first rosa enabled version when the latest version is not rosa enabled', async () => {
      const newVersions = [...versions];

      const latestVersion = {
        ...versions[0],
        raw_id: '4.12.99',
        id: 'openshift-v4.12.99',
        default: false,
        enabled: true,
        rosa_enabled: false,
        hosted_control_plane_enabled: false,
      };

      newVersions.unshift(latestVersion);

      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, versions: newVersions } },
      };
      const newProps = {
        ...defaultProps,
        onChange: onChangeMock,
      };
      const newFields = {
        ...defaultFields,
      };
      withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      // onChange is called on render to set the default version
      expect(onChangeMock).toHaveBeenCalled();
      expect(onChangeMock).not.toHaveBeenCalledWith(latestVersion);

      expect(newVersions[1].rosa_enabled).toBeTruthy();
      expect(onChangeMock).toHaveBeenCalledWith(newVersions[1]);
    });

    it('opens/closes when the user clicks on main menu button', async () => {
      // Arrange
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newProps = {
        ...defaultProps,
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Act
      await user.click(
        screen.getByRole('button', {
          name: defaultFields[FieldId.ClusterVersion],
        }),
      );

      // Assert
      expect(screen.getAllByRole('listbox').length).toBeGreaterThan(0);
      expect(screen.getByText(defaultProps.label)).toBeInTheDocument();

      // Act
      await user.click(
        screen.getByRole('button', {
          name: defaultFields[FieldId.ClusterVersion],
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('calls onChange function when an option is selected', async () => {
      // Arrange
      const version = '4.12.1';
      const selectedClusterVersion = versions.find((v) => v.raw_id === version);
      expect(selectedClusterVersion).not.toBeUndefined();

      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newProps = {
        ...defaultProps,
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...newProps} />
        </Formik>,
      );

      // this is due to preselecting an item
      expect(onChangeMock.mock.calls).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Act
      // Click a different version to ensure onChange is called again
      const versionToSelect = '4.11.4';
      const selectedVersionAfterClick = versions.find((v) => v.raw_id === versionToSelect);
      expect(selectedVersionAfterClick).not.toBeUndefined();
      await user.click(screen.getByRole('option', { name: versionToSelect }));

      // Assert
      await waitFor(() => {
        expect(onChangeMock.mock.calls).toHaveLength(2);
      });
      expect(onChangeMock.mock.calls[1][0]).toEqual(selectedVersionAfterClick);
    });

    it('resets value when selected version is not valid', async () => {
      // In this case, it is a hypershift cluster, but the selected version is not hosted_control_plane_enabled

      const selectedClusterVersion = {
        channel_group: 'stable',
        default: false,
        enabled: true,
        end_of_life_timestamp: '2024-03-17T00:00:00Z',
        hosted_control_plane_enabled: false,
        id: 'openshift-v4.10.2',
        raw_id: '4.10.2',
        rosa_enabled: true,
      };
      const newVersions = [...versions, selectedClusterVersion];

      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, versions: newVersions } },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.ClusterVersion]: selectedClusterVersion,
        [FieldId.Hypershift]: 'true',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <div>
            <VersionSelection {...defaultProps} />
          </div>
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(onChangeMock).toHaveBeenCalledWith(undefined);

      // After that it renders again, sees it has no value and picks a new default.
      await waitFor(() =>
        expect(screen.getAllByRole('option', { selected: true, name: '4.12.1' })).toHaveLength(1),
      );
      expect(onChangeMock.mock.calls).toHaveLength(2);
      expect(onChangeMock.mock.lastCall[0]).toMatchObject({ raw_id: '4.12.1' });
    });

    it('resets value when selected version does not exist', async () => {
      // In this case, the selected version isn't in the version list at all
      expect(versions.some((ver) => ver.raw_id === '4.10.9999')).toBeFalsy();

      const state = { clusters: { clusterVersions: { ...fulfilledVersionsState } } };
      const newFields = {
        ...defaultFields,
        [FieldId.ClusterVersion]: { raw_id: '4.10.9999', id: 'openshift-4.10.9999' },
      };

      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <div>
            <VersionSelection {...defaultProps} />
          </div>
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(onChangeMock).toHaveBeenCalledWith(undefined);

      // After that it renders again, sees it has no value and picks a new default.
      await waitFor(() =>
        expect(screen.getAllByRole('option', { selected: true, name: '4.12.1' })).toHaveLength(1),
      );
      expect(onChangeMock.mock.calls).toHaveLength(2);
      expect(onChangeMock.mock.lastCall[0]).toMatchObject({ raw_id: '4.12.1' });
    });

    it('displays only matching results when text is entered', async () => {
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={defaultFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      // Open the dropdown
      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Find the filter input and type
      const filterInput = screen.getByPlaceholderText('Filter by version number');

      await user.type(filterInput, '4.11');

      // Assert that only versions matching the filter are shown
      expect(screen.getByRole('option', { name: '4.11 .4' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.11 .3' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.12.1' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.10.1' })).not.toBeInTheDocument();
    });

    it('filters results by compatibility and text input', async () => {
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.11.3',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      const compatibleSwitch = screen.getByLabelText('View only compatible versions');
      expect(compatibleSwitch).toBeInTheDocument();
      expect(compatibleSwitch).toBeChecked();

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      const filterInput = screen.getByPlaceholderText('Filter by version number');
      await user.type(filterInput, '4.11.4');

      expect(screen.queryByRole('option', { name: '4.11.4' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.12.1' })).not.toBeInTheDocument();

      await user.click(compatibleSwitch);

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(screen.getByRole('option', { name: '4.11.4' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.11.3' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.12.1' })).not.toBeInTheDocument();
    });

    it('clears the text filter when compatibility switch is toggled', async () => {
      const state = { clusters: { clusterVersions: fulfilledVersionsState } };
      const newFields = {
        ...defaultFields,
        [FieldId.RosaMaxOsVersion]: '4.11.3',
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));
      const filterInput = screen.getByPlaceholderText('Filter by version number');
      await user.type(filterInput, '4.12');

      expect(filterInput).toHaveValue('4.12');

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      const compatibleSwitch = screen.getByLabelText('View only compatible versions');
      await user.click(compatibleSwitch);

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      expect(filterInput).toHaveValue('');
    });
  });
  describe('Test feature flag unstable versions', () => {
    it('hides unstable versions when feature flag is turned off', async () => {
      mockUseFeatureGate([[UNSTABLE_CLUSTER_VERSIONS, false]]);
      // Arrange
      const state = {
        clusters: { clusterVersions: { ...fulfilledVersionsState, params: { product: 'hcp' } } },
        rosaReducer: { getAWSAccountRolesARNsResponse: managedARNsState },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
        ...managedARNsFields,
      };

      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.12.1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.11.4' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.11.5 (candidate)' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '4.11.5 (fast)' })).not.toBeInTheDocument();
    });
    it('show unstable versions when feature flag is turned on', async () => {
      mockUseFeatureGate([[UNSTABLE_CLUSTER_VERSIONS, true]]);
      // Arrange
      const state = {
        clusters: { clusterVersions: { ...fulfilledAllVersionsState, params: { product: 'hcp' } } },
        rosaReducer: { getAWSAccountRolesARNsResponse: managedARNsState },
      };
      const newFields = {
        ...defaultFields,
        [FieldId.Hypershift]: 'true',
        ...managedARNsFields,
      };
      const { user } = withState(state).render(
        <Formik onSubmit={() => {}} initialValues={newFields}>
          <VersionSelection {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: componentText.SELECT_TOGGLE.label }));

      // Assert
      expect(await screen.findByText(defaultProps.label)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.12.1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '4.11.4' })).toBeInTheDocument();
      expect(document.getElementById('openshift-v4.11.5-fast')).toBeInTheDocument();
      expect(document.getElementById('openshift-v4.11.5-candidate')).toBeInTheDocument();
    });
  });
});
