import React from 'react';
import { Formik } from 'formik';

import { AWS_BILLING_IN_BOUNDARY } from '~/queries/featureGates/featureConstants';
import { normalizeSTSUsersByAWSAccounts } from '~/redux/actions/rosaActions';
import {
  checkAccessibility,
  mockRestrictedEnv,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
  withState,
} from '~/testUtils';

import { initialValues } from '../../constants';
import AccountsRolesScreen, {
  AccountsRolesScreenProps,
  isUserRoleForSelectedAWSAccount,
} from '../AccountsRolesScreen';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

const accountRolesScreenProps: AccountsRolesScreenProps = {
  getAWSAccountIDs: () => {},
  getAWSAccountIDsResponse: () => {},
  getAWSAccountRolesARNs: () => {},
  getAWSAccountRolesARNsResponse: () => {},
  getUserRoleResponse: () => {},
  clearGetAWSAccountIDsResponse: () => {},
  clearGetAWSAccountRolesARNsResponse: () => {},
  clearGetUserRoleResponse: () => {},
  organizationID: 'org-id',
  isHypershiftEnabled: true,
  isHypershiftSelected: false,
};

const buildTestComponent = (children: React.ReactNode, formValues = {}) => (
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

describe('<AccountsRolesScreen />', () => {
  it('is accessible', async () => {
    const { container } = withState({}).render(
      buildTestComponent(<AccountsRolesScreen {...accountRolesScreenProps} />),
    );

    await checkAccessibility(container);
  });

  it('does not show the welcome and prerequisites sections for users with HyperShift enabled', async () => {
    withState({}).render(buildTestComponent(<AccountsRolesScreen {...accountRolesScreenProps} />));

    await waitFor(() => {
      expect(
        screen.queryByText('Welcome to Red Hat OpenShift Service on AWS (ROSA)'),
      ).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Did you complete your prerequisites?')).not.toBeInTheDocument();
  });

  it('shows the welcome and prerequisites sections for users with HyperShift disabled without the CLI warning', async () => {
    const props = { ...accountRolesScreenProps, isHypershiftEnabled: false };
    withState({}).render(buildTestComponent(<AccountsRolesScreen {...props} />));

    expect(
      await screen.findByText('Welcome to Red Hat OpenShift Service on AWS (ROSA)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Did you complete your prerequisites?')).toBeInTheDocument();
    expect(screen.queryByText(/Make sure you are using ROSA CLI version/)).not.toBeInTheDocument();
  });

  describe('AWS Billing Account visibility', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    const hypershiftSelectedProps = { ...accountRolesScreenProps, isHypershiftSelected: true };

    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    it('shows AWS Billing Account in Commercial environment regardless of feature flag', async () => {
      isRestrictedEnv.mockReturnValue(false);
      mockUseFeatureGate([[AWS_BILLING_IN_BOUNDARY, false]]);

      render(buildTestComponent(<AccountsRolesScreen {...hypershiftSelectedProps} />));

      expect(
        await screen.findByRole('heading', { name: 'AWS billing account', level: 3 }),
      ).toBeInTheDocument();
    });

    it('hides AWS Billing Account in restricted environment when feature flag is OFF', async () => {
      isRestrictedEnv.mockReturnValue(true);
      mockUseFeatureGate([[AWS_BILLING_IN_BOUNDARY, false]]);

      render(buildTestComponent(<AccountsRolesScreen {...hypershiftSelectedProps} />));

      // Wait for component to render by finding an element that IS expected to show
      await screen.findByRole('heading', { name: 'AWS infrastructure account', level: 3 });
      expect(
        screen.queryByRole('heading', { name: 'AWS billing account', level: 3 }),
      ).not.toBeInTheDocument();
    });

    it('shows AWS Billing Account in restricted environment when feature flag is ON', async () => {
      isRestrictedEnv.mockReturnValue(true);
      mockUseFeatureGate([[AWS_BILLING_IN_BOUNDARY, true]]);

      render(buildTestComponent(<AccountsRolesScreen {...hypershiftSelectedProps} />));

      expect(
        await screen.findByRole('heading', { name: 'AWS billing account', level: 3 }),
      ).toBeInTheDocument();
    });

    it('hides AWS Billing Account when HyperShift is not selected', async () => {
      isRestrictedEnv.mockReturnValue(false);
      mockUseFeatureGate([[AWS_BILLING_IN_BOUNDARY, true]]);
      const classicProps = { ...accountRolesScreenProps, isHypershiftSelected: false };

      render(buildTestComponent(<AccountsRolesScreen {...classicProps} />));

      // Wait for component to render by finding an element that IS expected to show
      await screen.findByRole('heading', { name: 'AWS infrastructure account', level: 3 });
      expect(
        screen.queryByRole('heading', { name: 'AWS billing account', level: 3 }),
      ).not.toBeInTheDocument();
    });
  });
});

describe('isUserRoleForSelectedAWSAccount', () => {
  it.each([
    ['returns false when no user detected', '', '000000000006', 0, false],
    [
      'returns true when user detected which matches selected aws account',
      'arn:aws:iam::000000000006:role/ManagedOpenShift-User-dtaylor-ocm-Role',
      '000000000006',
      1,
      true,
    ],
    [
      'returns false when user detected but their aws acct doesnt matches selected aws account',
      'arn:aws:iam::000000000006:role/ManagedOpenShift-User-dtaylor-ocm-Role',
      '119733383077',
      1,
      false,
    ],
    [
      'returns true when multiple users detected and one matches selected aws account',
      'arn:aws:iam::000000000006:role/ManagedOpenShift-User-dtaylor-ocm-Role,arn:aws:iam::119733383044:role/ManagedOpenShift-User-foobar-ocm-Role',
      '119733383044',
      2,
      true,
    ],
  ])(
    '%p',
    (
      title: string,
      users: string,
      selectedAwsAcctId: string,
      expectedLength: number,
      expectedResult: boolean,
    ) => {
      const usersByAcctIds = normalizeSTSUsersByAWSAccounts(users);
      expect(usersByAcctIds.length).toEqual(expectedLength);
      const result = isUserRoleForSelectedAWSAccount(usersByAcctIds, selectedAwsAcctId);
      expect(result).toBe(expectedResult);
    },
  );
});
