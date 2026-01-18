import React from 'react';
import { Formik } from 'formik';

import links from '~/common/installLinks.mjs';
import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import { HCP_USE_UNMANAGED } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import { initialValues } from '../../constants';
import AccountRolesARNsSection, {
  getDefaultInstallerRole,
} from '../AccountRolesARNsSection/AccountRolesARNsSection';

const latestOCPVersion = '4.13.3';
const latestVersionLoaded = '4.13.5';

jest.mock('~/hooks/useAnalytics', () => jest.fn(() => jest.fn()));
jest.mock('~/components/releases/hooks', () => ({
  useOCPLatestVersion: () => [latestOCPVersion, latestVersionLoaded],
}));

const buildTestComponent = (children, formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
    }}
    onSubmit={() => {}}
  >
    {children}
  </Formik>
);

const accountRolesList = [
  {
    prefix: 'myManagedRoles',
    managedPolicies: true,
    hcpManagedPolicies: true,
    version: '4.13.0',
    Installer: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
    Support: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Support-Role',
    Worker: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Worker-Role',
  },
  {
    prefix: 'myUnManagedRoles',
    managedPolicies: false,
    hcpManagedPolicies: false,
    version: '4.13.0',
    ControlPlane: 'arn:aws:iam::123456789012:role/myUnManagedRoles-ControlPlane-Role',
    Installer: 'arn:aws:iam::123456789012:role/myUnManagedRoles-Installer-Role',
    Support: 'arn:aws:iam::123456789012:role/myUnManagedRoles-Support-Role',
    Worker: 'arn:aws:iam::123456789012:role/myUnManagedRoles-Worker-Role',
  },
  {
    prefix: 'bothRoles',
    managedPolicies: true,
    hcpManagedPolicies: true,
    version: '4.13.0',
    Installer: 'arn:aws:iam::123456789012:role/bothRoles-HCP-ROSA-Installer-Role',
    Support: 'arn:aws:iam::123456789012:role/bothRoles-HCP-ROSA-Support-Role',
    Worker: 'arn:aws:iam::123456789012:role/bothRoles-HCP-ROSA-Worker-Role',
  },
  {
    prefix: 'bothRoles',
    managedPolicies: false,
    hcpManagedPolicies: false,
    version: '4.13.0',
    ControlPlane: 'arn:aws:iam::123456789012:role/bothRoles-ControlPlane-Role',
    Installer: 'arn:aws:iam::123456789012:role/bothRoles-Installer-Role',
    Support: 'arn:aws:iam::123456789012:role/bothRoles-Support-Role',
    Worker: 'arn:aws:iam::123456789012:role/bothRoles-Worker-Role',
  },
];

const isRendered = async () => expect(await screen.findByText('Account roles')).toBeInTheDocument();

describe('<AccountRolesARNsSection />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
  const props = {
    selectedAWSAccountID: '',
    selectedInstallerRoleARN: '',
    rosaMaxOSVersion: '4.13.1',
    getAWSAccountRolesARNs: jest.fn(),
    getAWSAccountRolesARNsResponse: {
      fulfilled: true,
      error: false,
      pending: false,
      data: accountRolesList,
    },
    clearGetAWSAccountRolesARNsResponse: jest.fn(),
    isHypershiftSelected: true,
    onAccountChanged: jest.fn(),
  };

  it('is accessible', async () => {
    const { container } = render(buildTestComponent(<AccountRolesARNsSection {...props} />));

    await checkAccessibility(container);
    await isRendered();
  });

  it('Shows only unmanaged policy roles for non hypershift cluster', async () => {
    const newProps = { ...props, isHypershiftSelected: false };
    const { user } = render(buildTestComponent(<AccountRolesARNsSection {...newProps} />));
    await isRendered();

    // expand installer drop-down
    await user.click(screen.getByRole('button', { name: 'Options menu' }));

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/myUnManagedRoles-Installer-Role',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/bothRoles-Installer-Role',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('option', {
        name: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('option', {
        name: 'arn:aws:iam::123456789012:role/bothRoles-HCP-ROSA-Installer-Role',
      }),
    ).not.toBeInTheDocument();
  });

  it('Shows only managed policy roles for hypershift cluster and feature flag is false', async () => {
    mockUseFeatureGate([[HCP_USE_UNMANAGED, false]]);

    const newProps = { ...props, isHypershiftSelected: true };
    const { user } = render(buildTestComponent(<AccountRolesARNsSection {...newProps} />));
    await isRendered();

    // expand installer drop-down
    await user.click(screen.getByRole('button', { name: 'Options menu' }));

    expect(
      screen.queryByRole('option', {
        name: 'arn:aws:iam::123456789012:role/myUnManagedRoles-Installer-Role',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('option', {
        name: 'arn:aws:iam::123456789012:role/bothRoles-Installer-Role',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/bothRoles-HCP-ROSA-Installer-Role',
      }),
    ).toBeInTheDocument();
  });

  it('Shows only both managed and unmanaged policy roles for hypershift cluster and feature flag is true', async () => {
    mockUseFeatureGate([[HCP_USE_UNMANAGED, true]]);
    const newProps = { ...props, isHypershiftSelected: true };
    const { user } = render(buildTestComponent(<AccountRolesARNsSection {...newProps} />));
    await isRendered();

    // expand installer drop-down
    await user.click(screen.getByRole('button', { name: 'Options menu' }));

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/myUnManagedRoles-Installer-Role',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/bothRoles-Installer-Role',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/myManagedRoles-HCP-ROSA-Installer-Role',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'arn:aws:iam::123456789012:role/bothRoles-HCP-ROSA-Installer-Role',
      }),
    ).toBeInTheDocument();
  });

  describe('default installer role', () => {
    const mockAccountRoles = {
      completeManagedOpenShiftPrefixARNset: {
        Installer: 'ManagedOpenShift-Installer-Role',
        Support: 'ManagedOpenShift-Support-Role',
        Worker: 'ManagedOpenShift-Worker-Role',
        ControlPlane: 'ManagedOpenShift-ControlPlane-Role',
        prefix: 'ManagedOpenShift',
        managedPolicies: true,
      },
      completeCustomPrefixARNset: {
        Installer: 'Cypress-Installer-Role',
        Support: 'Cypress-Support-Role',
        Worker: 'Cypress-Worker-Role',
        ControlPlane: 'Cypress-ControlPlane-Role',
        prefix: 'Cypress',
      },
      incompleteManagedOpenShiftPrefixARNset: {
        Installer: 'ManagedOpenShift-Installer-Role-Incomplete',
        prefix: 'ManagedOpenShift',
      },
      incompleteCustomPrefixARNset: {
        Installer: 'Cypress-Installer-Role-Incomplete',
        prefix: 'Cypress',
      },
      noPrefixARNset: {
        Installer: 'NoPrefix-Installer-Role',
        Support: 'NoPrefix-Support-Role',
        Worker: 'NoPrefix-Worker-Role',
      },
    };

    it('selects the currently selected role if available', () => {
      const roles = [
        mockAccountRoles.completeManagedOpenShiftPrefixARNset,
        mockAccountRoles.completeCustomPrefixARNset,
      ];
      const selected = mockAccountRoles.completeCustomPrefixARNset.Installer;
      const result = getDefaultInstallerRole(selected, roles, false);
      expect(result).toBe(selected);
    });

    it('selects a complete role set with "ManagedOpenShift" prefix', () => {
      const roles = [
        mockAccountRoles.completeCustomPrefixARNset,
        mockAccountRoles.completeManagedOpenShiftPrefixARNset,
      ];
      const result = getDefaultInstallerRole(undefined, roles, false);
      expect(result).toBe(mockAccountRoles.completeManagedOpenShiftPrefixARNset.Installer);
    });

    it('selects a complete role set with managed policies if no "ManagedOpenShift" prefix', () => {
      const managedPolicyRole = {
        ...mockAccountRoles.completeCustomPrefixARNset,
        managedPolicies: true,
      };
      const roles = [mockAccountRoles.noPrefixARNset, managedPolicyRole];
      const result = getDefaultInstallerRole(undefined, roles, false);
      expect(result).toBe(managedPolicyRole.Installer);
    });

    it('selects any complete role set as a fallback', () => {
      const roles = [
        mockAccountRoles.incompleteManagedOpenShiftPrefixARNset,
        mockAccountRoles.completeCustomPrefixARNset,
      ];
      const result = getDefaultInstallerRole(undefined, roles, false);
      expect(result).toBe(mockAccountRoles.completeCustomPrefixARNset.Installer);
    });

    it('selects an incomplete "ManagedOpenShift" role if no complete roles exist', () => {
      const roles = [
        mockAccountRoles.incompleteCustomPrefixARNset,
        mockAccountRoles.incompleteManagedOpenShiftPrefixARNset,
      ];
      const result = getDefaultInstallerRole(undefined, roles, false);
      expect(result).toBe(mockAccountRoles.incompleteManagedOpenShiftPrefixARNset.Installer);
    });

    it('selects the first role if no other conditions are met', () => {
      const roles = [
        mockAccountRoles.incompleteCustomPrefixARNset,
        mockAccountRoles.noPrefixARNset,
      ];
      const result = getDefaultInstallerRole(undefined, roles, false);
      expect(result).toBe(mockAccountRoles.incompleteCustomPrefixARNset.Installer);
    });

    it('returns "No role detected" if no roles are available', () => {
      const result = getDefaultInstallerRole(undefined, [], false);
      expect(result).toBe('No role detected');
    });
  });

  describe('ROSA CLI requirement message', () => {
    const rosaCLIMessage = `You must use ROSA CLI version ${ROSA_HOSTED_CLI_MIN_VERSION} or above.`;

    const getIncompleteRoleSets = ({ isHypershift }) =>
      accountRolesList
        .filter((role) => (isHypershift ? role.hcpManagedPolicies : !role.hcpManagedPolicies))
        .map((role) => ({ ...role, Support: undefined }));

    it('is shown when not all ARNs are detected and Hypershift has been selected', async () => {
      const testProps = {
        ...props,
        getAWSAccountRolesARNsResponse: {
          fulfilled: true,
          error: false,
          pending: false,
          data: getIncompleteRoleSets({ isHypershift: true }),
        },
      };
      render(buildTestComponent(<AccountRolesARNsSection {...testProps} />));
      await isRendered();

      expect(screen.getByText(rosaCLIMessage)).toBeInTheDocument();
    });

    it('is not shown when not all ARNs are detected and ROSA classic has been selected', async () => {
      const newProps = {
        ...props,
        getAWSAccountRolesARNsResponse: {
          fulfilled: true,
          error: false,
          pending: false,
          data: getIncompleteRoleSets({ isHypershift: false }),
        },
        isHypershiftSelected: false,
      };
      render(buildTestComponent(<AccountRolesARNsSection {...newProps} />));
      await isRendered();

      expect(screen.queryByText(rosaCLIMessage)).not.toBeInTheDocument();
      expect(screen.getByText('Some account roles ARNs were not detected')).toBeInTheDocument();
    });

    it('shows "Cannot detect an OCM role" error message', async () => {
      const newProps = {
        ...props,
        getAWSAccountRolesARNsResponse: {
          fulfilled: false,
          error: true,
          pending: false,
          errorCode: 400,
          internalErrorCode: 'CLUSTERS-MGMT-400',
          errorMessage:
            "CLUSTERS-MGMT-400:\nFailed to assume role with ARN 'arn:aws:iam::000000000002:role/ManagedOpenShift-OCM-Role-15212158': operation error STS: AssumeRole, https response error StatusCode: 403, RequestID: 40314369-b5e1-4d1a-94f1-5014b7419dea, api error AccessDenied: User: arn:aws:sts::644306948063:assumed-role/RH-Managed-OpenShift-Installer/OCM is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::000000000002:role/ManagedOpenShift-OCM-Role-15212158",
        },
        isHypershiftSelected: false,
      };
      render(buildTestComponent(<AccountRolesARNsSection {...newProps} />));
      await isRendered();

      expect(screen.queryByText(rosaCLIMessage)).not.toBeInTheDocument();
      expect(screen.getByText('Cannot detect an OCM role')).toBeInTheDocument();
      expect(screen.getByText('create the required role')).toBeInTheDocument();
    });
  });

  describe('Documentation link', () => {
    it('is rendered correctly for hypershift clusters', async () => {
      render(buildTestComponent(<AccountRolesARNsSection {...props} />));

      const link = screen.getByText('Learn more about account roles');

      expect(link).toHaveAttribute('href', links.ROSA_AWS_IAM_RESOURCES);
    });

    it('is rendered correctly for hypershift clusters', async () => {
      render(
        buildTestComponent(<AccountRolesARNsSection {...props} isHypershiftSelected={false} />),
      );

      const link = screen.getByText('Learn more about account roles');

      expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_IAM_RESOURCES);
    });
  });
});
