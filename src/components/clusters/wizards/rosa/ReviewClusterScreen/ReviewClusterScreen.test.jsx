import React from 'react';
import { Formik } from 'formik';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import useOrganization from '~/components/CLILoginPage/useOrganization';
import { OCM_ROLE_NO_CONSOLE_PROFILE } from '~/components/clusters/wizards/rosa/rosaConstants';
import {
  ALLOW_EUS_CHANNEL,
  OCM_ROLE_NO_CONSOLE,
  Y_STREAM_CHANNEL,
} from '~/queries/featureGates/featureConstants';
import {
  refetchGetOCMRole,
  useFetchGetOCMRole,
} from '~/queries/RosaWizardQueries/useFetchGetOCMRole';
import { mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';

import { initialValues } from '../constants';

import sampleFormData from './mockHCPCluster';
import ReviewClusterScreen from './ReviewClusterScreen';

jest.mock('~/components/CLILoginPage/useOrganization');

jest.mock('~/queries/RosaWizardQueries/useFetchGetOCMRole', () => ({
  useFetchGetOCMRole: jest.fn().mockReturnValue({
    data: { profile: 'standard' },
    isSuccess: true,
    isPending: false,
  }),
  refetchGetOCMRole: jest.fn(),
}));

const mockUseOrganization = jest.mocked(useOrganization);

const buildTestComponent = (children, formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...sampleFormData.values,
      ...formValues,
    }}
    initialTouched={{}}
    onSubmit={() => {}}
  >
    {children}
  </Formik>
);

const defaultProps = {
  getUserRole: () => {},
  getOCMRole: () => {},
  getOCMRoleResponse: () => {},
  getUserRoleResponse: {},
  clearGetUserRoleResponse: () => {},
  clearGetOcmRoleResponse: () => {},
  goToStepById: () => {},
  createClusterResponse: {},
};

describe('<ReviewClusterScreen />', () => {
  beforeEach(() => {
    mockUseOrganization.mockReturnValue({ organization: {}, isLoading: false, error: null });
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  describe('AWS Billing account', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('is shown when', () => {
      it('isHypershift and has value', async () => {
        render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

        expect(await screen.findByText('AWS infrastructure account ID')).toBeInTheDocument();
        expect(screen.getByText('210987654321')).toBeInTheDocument();
        expect(screen.getByText('AWS billing account ID')).toBeInTheDocument();
        expect(screen.getByText('123456789012')).toBeInTheDocument();
      });

      it('isHypershift and has no value', async () => {
        render(
          buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
            billing_account_id: undefined,
          }),
        );

        expect(await screen.findByText('AWS infrastructure account ID')).toBeInTheDocument();
        expect(screen.getByText('210987654321')).toBeInTheDocument();
        expect(screen.getByText('AWS billing account ID')).toBeInTheDocument();
      });
    });
    describe('is hidden when', () => {
      it('is not isHypershift', async () => {
        render(
          buildTestComponent(<ReviewClusterScreen {...defaultProps} />, { hypershift: 'false' }),
        );

        expect(await screen.findByText('AWS infrastructure account ID')).toBeInTheDocument();
        expect(screen.getByText('210987654321')).toBeInTheDocument();
        expect(screen.queryByText('AWS billing account ID')).not.toBeInTheDocument();
        expect(screen.queryByText('123456789012')).not.toBeInTheDocument();
      });
    });
  });

  describe('Security groups', () => {
    it('is not shown for Hypershift clusters', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          securityGroups: undefined /* The form field is not initialized for HCP */,
        }),
      );

      await waitFor(() => {
        expect(screen.queryByText('Security groups')).not.toBeInTheDocument();
      });
    });

    it('is shown for ROSA classic clusters', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          hypershift: 'false',
          securityGroups: {
            controlPlane: ['sg-ab'],
            infra: ['sg-cd'],
            worker: ['sg-ef'],
          },
        }),
      );

      expect(await screen.findByText('Security groups')).toBeInTheDocument();
      expect(screen.getByText('Control plane nodes')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure nodes')).toBeInTheDocument();
      expect(screen.getByText('Worker nodes')).toBeInTheDocument();
    });

    it('shows the controlPlane groups as "All nodes" when "applyControlPlaneToAll" is true', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          hypershift: 'false',
          securityGroups: {
            applyControlPlaneToAll: true,
            controlPlane: ['sg-abc'],
            infra: ['sg-should-be-ignored'],
            worker: ['sg-should-be-ignored-too'],
          },
        }),
      );

      expect(await screen.findByText('Security groups')).toBeInTheDocument();
      expect(screen.getByText('All nodes')).toBeInTheDocument();

      expect(screen.queryByText('Control plane nodes')).not.toBeInTheDocument();
      expect(screen.queryByText('sg-should-be-ignored')).not.toBeInTheDocument();
      expect(screen.queryByText('sg-should-be-ignored-too')).not.toBeInTheDocument();
    });

    it('does not show a node type that does not have groups', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          hypershift: 'false',
          securityGroups: {
            applyControlPlaneToAll: false,
            controlPlane: ['sg-abc'],
            infra: [],
            worker: ['sg-def'],
          },
        }),
      );

      expect(await screen.findByText('Security groups')).toBeInTheDocument();
      expect(screen.getByText('Control plane nodes')).toBeInTheDocument();
      expect(screen.queryByText('Infrastructure nodes')).not.toBeInTheDocument();
    });
  });

  describe('Shared VPC settings', () => {
    const getFormValuesWithSharedVpcSettings = (
      isSharedVpcSelected,
      isHypershiftSelected = true,
    ) => ({
      hypershift: isHypershiftSelected ? 'true' : 'false',
      shared_vpc: {
        is_allowed: true,
        is_selected: isSharedVpcSelected,
        hosted_zone_id: 'ZONE-ID-ABC',
      },
    });
    describe('is shown when', () => {
      it('has checked Shared VPC and it is not Hypershift', async () => {
        render(
          buildTestComponent(
            <ReviewClusterScreen {...defaultProps} />,
            getFormValuesWithSharedVpcSettings(true, false),
          ),
        );

        expect(await screen.findByText('Shared VPC settings')).toBeInTheDocument();
        expect(screen.getByText('Private hosted zone ID')).toBeInTheDocument();
        expect(screen.getByText('ZONE-ID-ABC')).toBeInTheDocument();
      });
    });

    describe('is hidden when', () => {
      it('has checked Shared VPC but it is Hypershift', async () => {
        render(
          buildTestComponent(
            <ReviewClusterScreen {...defaultProps} />,
            getFormValuesWithSharedVpcSettings(true),
          ),
        );

        await waitFor(() => {
          expect(screen.queryByText('Shared VPC settings')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('ZONE-ID-ABC')).not.toBeInTheDocument();
      });

      it('has not checked Shared VPC', async () => {
        render(
          buildTestComponent(<ReviewClusterScreen {...defaultProps} />),
          getFormValuesWithSharedVpcSettings(false, false),
        );

        await waitFor(() => {
          expect(screen.queryByText('Shared VPC settings')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('ZONE-ID-ABC')).not.toBeInTheDocument();
      });
    });
  });

  describe('Hypershift VPC section', () => {
    const getFormValuesWithSelectedVpcSettings = (
      isVPCNamePresent = true,
      isHypershiftSelected = true,
    ) => ({
      hypershift: isHypershiftSelected ? 'true' : 'false',
      selected_vpc: {
        ...sampleFormData.values.selected_vpc,
        name: isVPCNamePresent ? 'actual-vpc-name' : undefined,
      },
    });

    it('is shown for Hypershift clusters', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithSelectedVpcSettings(),
        ),
      );

      expect(await screen.findByText('Install to selected VPC')).toBeInTheDocument();
      expect(screen.queryByText('Install into existing VPC')).not.toBeInTheDocument();
    });

    it('is not shown for non-Hypershift clusters', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithSelectedVpcSettings(true, false),
        ),
      );

      await waitFor(() => {
        expect(screen.queryByText('Install to selected VPC')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Install into existing VPC')).toBeInTheDocument();
    });

    it('shows the VPC name if available', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithSelectedVpcSettings(),
        ),
      );

      expect(await screen.findByText('actual-vpc-name')).toBeInTheDocument();
      expect(screen.queryByText(sampleFormData.values.selected_vpc.id)).not.toBeInTheDocument();
    });

    it('shows the VPC ID if name is not available', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithSelectedVpcSettings(false),
        ),
      );

      expect(await screen.findByText(sampleFormData.values.selected_vpc.id)).toBeInTheDocument();
      expect(screen.queryByText('actual-vpc-name')).not.toBeInTheDocument();
    });
  });

  describe('BYO VPC section', () => {
    const getFormValuesWithByoVpcSettings = (byoVpc = true, isHypershiftSelected = false) => ({
      hypershift: isHypershiftSelected ? 'true' : 'false',
      install_to_vpc: byoVpc,
    });

    it('is shown for BYO VPC ROSA classic clusters', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithByoVpcSettings(),
        ),
      );

      expect(await screen.findByText('Install into existing VPC')).toBeInTheDocument();
      expect(screen.queryByText('Install to selected VPC')).not.toBeInTheDocument();
    });

    it('is not shown for Hypershift clusters', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithByoVpcSettings(true, true),
        ),
      );

      await waitFor(() => {
        expect(screen.queryByText('Install into existing VPC')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Install to selected VPC')).toBeInTheDocument();
    });

    it('shows "Enabled" when it is a BYO VPC cluster', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithByoVpcSettings(),
        ),
      );

      await waitFor(() => {
        expect(screen.getByText('Install into existing VPC').closest('div')).toHaveTextContent(
          'Enabled',
        );
      });
    });

    it('shows "Disabled" when it is not a BYO VPC cluster', async () => {
      render(
        buildTestComponent(
          <ReviewClusterScreen {...defaultProps} />,
          getFormValuesWithByoVpcSettings(false),
        ),
      );

      await waitFor(() => {
        expect(screen.getByText('Install into existing VPC').closest('div')).toHaveTextContent(
          'Disabled',
        );
      });
    });
  });

  describe('Custom encryption key', () => {
    const customKeyLabel = 'Custom KMS key ARN';
    const keyARN = 'arn:aws:kms:us-east-1:000000000006:key/98a8df03-1d14-4eb5-84dc-82a3f490dfa9';

    it('is shown when present', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          kms_key_arn: keyARN,
          customer_managed_key: 'true',
        }),
      );

      expect(await screen.findByText(customKeyLabel)).toBeInTheDocument();
      expect(screen.getByText(keyARN)).toBeInTheDocument();
    });

    it('is absent when not present', async () => {
      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      await waitFor(() => {
        expect(screen.queryByText(customKeyLabel)).not.toBeInTheDocument();
      });

      expect(screen.queryByText(keyARN)).not.toBeInTheDocument();
    });
  });

  describe('Node drain grace period', () => {
    it('shows if not hypershift', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          hypershift: 'false',
          node_drain_grace_period: 60,
        }),
      );

      expect(await screen.findByText('Node draining')).toBeInTheDocument();
    });

    it('does not show if hypershift', async () => {
      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          hypershift: 'true',
          node_drain_grace_period: 60,
        }),
      );

      await waitFor(() => {
        expect(screen.queryByText('Node draining')).not.toBeInTheDocument();
      });
    });
  });
  describe('External Authentication', () => {
    describe('is not shown when', () => {
      it('is not Hypershift', () => {
        const newProps = { ...defaultProps, isHypershiftSelected: false };
        render(buildTestComponent(<ReviewClusterScreen {...newProps} />));

        expect(screen.queryByText('External Authentication')).toBeNull();
      });
      it('is not enabled', () => {
        const newProps = { ...defaultProps, isHypershiftSelected: true };
        render(buildTestComponent(<ReviewClusterScreen {...newProps} />));

        expect(screen.queryByText('External Authentication')).not.toBeInTheDocument();
      });
    });
    describe('is shown when', () => {
      it('isHypershift and is enabled', () => {
        const newProps = { ...defaultProps, isHypershiftSelected: true };
        mockUseOrganization.mockReturnValue({
          organization: {
            capabilities: [
              {
                name: subscriptionCapabilities.HCP_ALLOW_EXTERNAL_AUTHENTICATION,
                value: 'true',
                inherited: false,
              },
            ],
          },
          isLoading: false,
          error: null,
        });
        render(buildTestComponent(<ReviewClusterScreen {...newProps} />));

        expect(screen.getByText('External Authentication')).toBeInTheDocument();
      });
    });
  });

  describe('Channel group', () => {
    it('is shown when ALLOW_EUS_CHANNEL feature gate is enabled', async () => {
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);

      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          channel_group: 'stable',
        }),
      );

      expect(await screen.findByText('Channel group')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('is not shown when ALLOW_EUS_CHANNEL feature gate is disabled', async () => {
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, false]]);

      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          channel_group: 'stable',
        }),
      );

      await waitFor(() => {
        expect(screen.queryByText('Channel group')).not.toBeInTheDocument();
      });
    });

    it('is not shown when both ALLOW_EUS_CHANNEL and Y_STREAM_CHANNEL feature gates are enabled', async () => {
      mockUseFeatureGate([
        [ALLOW_EUS_CHANNEL, true],
        [Y_STREAM_CHANNEL, true],
      ]);

      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          channel_group: 'stable',
        }),
      );

      await waitFor(() => {
        expect(screen.queryByText('Channel group')).not.toBeInTheDocument();
      });
    });
  });

  describe('Channel', () => {
    it('is shown when Y_STREAM_CHANNEL feature gate is enabled', async () => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, true]]);

      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      expect(await screen.findByText('Channel')).toBeInTheDocument();
      expect(screen.getByText('fast-4.13')).toBeInTheDocument();
    });

    it('is not shown when Y_STREAM_CHANNEL feature gate is disabled', async () => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, false]]);

      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      await waitFor(() => {
        expect(screen.queryByText('Channel')).not.toBeInTheDocument();
      });
    });

    it('shows no channels message when the version has no available channels', async () => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, true]]);

      render(
        buildTestComponent(<ReviewClusterScreen {...defaultProps} />, {
          cluster_version: {
            ...sampleFormData.values.cluster_version,
            available_channels: [],
          },
          version_channel: '',
        }),
      );

      expect(await screen.findByText('Channel')).toBeInTheDocument();
      expect(
        screen.getByText('No channels available for the selected version'),
      ).toBeInTheDocument();
    });
  });

  describe('no_console OCM role', () => {
    const noConsoleRoleResponse = {
      data: { profile: OCM_ROLE_NO_CONSOLE_PROFILE },
      isSuccess: true,
      isPending: false,
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('shows danger alert when feature gate is on and profile is no_console', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      useFetchGetOCMRole.mockReturnValue(noConsoleRoleResponse);

      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      expect(await screen.findByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.getByText(/was created without console permissions/i)).toBeInTheDocument();
    });

    it('does not show alert when feature gate is off', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, false]]);
      useFetchGetOCMRole.mockReturnValue(noConsoleRoleResponse);

      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      await screen.findByText('Review your ROSA cluster');
      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();
    });

    it('calls refetchGetOCMRole on mount when feature gate is on', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);

      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      await screen.findByText('Review your ROSA cluster');
      expect(refetchGetOCMRole).toHaveBeenCalledWith('210987654321');
    });

    it('does not call refetchGetOCMRole on mount when feature gate is off', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, false]]);

      render(buildTestComponent(<ReviewClusterScreen {...defaultProps} />));

      await screen.findByText('Review your ROSA cluster');
      expect(refetchGetOCMRole).not.toHaveBeenCalled();
    });

    it('updates displayed OCM role ARN from React Query data when feature gate is on', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      useFetchGetOCMRole.mockReturnValue({
        data: { arn: 'arn:aws:iam::123:role/RefreshedRole', profile: 'standard' },
        isSuccess: true,
        isPending: false,
      });

      const propsWithFulfilledRedux = {
        ...defaultProps,
        getOCMRoleResponse: {
          fulfilled: true,
          data: { arn: 'arn:aws:iam::123:role/StaleReduxRole' },
        },
      };

      render(buildTestComponent(<ReviewClusterScreen {...propsWithFulfilledRedux} />));

      // The ARN from React Query (RefreshedRole) should take precedence over the stale Redux value
      expect(await screen.findByText('arn:aws:iam::123:role/RefreshedRole')).toBeInTheDocument();
      expect(screen.queryByText('arn:aws:iam::123:role/StaleReduxRole')).not.toBeInTheDocument();
    });

    it('uses Redux ARN for OCM role display when feature gate is off', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, false]]);
      useFetchGetOCMRole.mockReturnValue({
        data: { arn: 'arn:aws:iam::123:role/ReactQueryRole', profile: 'standard' },
        isSuccess: true,
        isPending: false,
      });

      const propsWithFulfilledRedux = {
        ...defaultProps,
        getOCMRoleResponse: {
          fulfilled: true,
          data: { arn: 'arn:aws:iam::123:role/ReduxRole' },
        },
      };

      render(buildTestComponent(<ReviewClusterScreen {...propsWithFulfilledRedux} />));

      // The ARN from Redux should be shown — React Query data is not used when flag is off
      expect(await screen.findByText('arn:aws:iam::123:role/ReduxRole')).toBeInTheDocument();
      expect(screen.queryByText('arn:aws:iam::123:role/ReactQueryRole')).not.toBeInTheDocument();
    });

    it('shows ocm-role error when Refresh returns an error (no role linked) and feature gate is on', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      // Simulate Refresh result: React Query got an error (no OCM role linked)
      useFetchGetOCMRole.mockReturnValue({
        data: undefined,
        isError: true,
        isSuccess: false,
        isPending: false,
      });

      // Redux state is stale — still fulfilled with old ARN
      const propsWithStaleRedux = {
        ...defaultProps,
        getOCMRoleResponse: {
          fulfilled: true,
          data: { arn: 'arn:aws:iam::123:role/OldUnlinkedRole' },
        },
      };

      render(buildTestComponent(<ReviewClusterScreen {...propsWithStaleRedux} />));

      // Error state from React Query should be reflected: "could not be detected" shown
      expect(await screen.findByText(/ocm-role could not be detected/i)).toBeInTheDocument();
      // Stale Redux ARN must not appear
      expect(screen.queryByText('arn:aws:iam::123:role/OldUnlinkedRole')).not.toBeInTheDocument();
    });

    it('does not change ocm-role display when Refresh returns an error and feature gate is off', async () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, false]]);
      // React Query has an error — but the flag is off so Redux is still the source of truth
      useFetchGetOCMRole.mockReturnValue({
        data: undefined,
        isError: true,
        isSuccess: false,
        isPending: false,
      });

      const propsWithFulfilledRedux = {
        ...defaultProps,
        getOCMRoleResponse: {
          fulfilled: true,
          data: { arn: 'arn:aws:iam::123:role/ReduxRole' },
        },
      };

      render(buildTestComponent(<ReviewClusterScreen {...propsWithFulfilledRedux} />));

      // Redux says fulfilled + has ARN → should be displayed normally (no error)
      expect(await screen.findByText('arn:aws:iam::123:role/ReduxRole')).toBeInTheDocument();
      expect(screen.queryByText(/ocm-role could not be detected/i)).not.toBeInTheDocument();
    });
  });
});
