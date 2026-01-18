import React from 'react';
import { Formik } from 'formik';

import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import { render, screen, waitFor } from '~/testUtils';

import links from '../../../../../common/installLinks.mjs';
import { useFetchGetUserOidcConfigurations } from '../../../../../queries/RosaWizardQueries/useFetchGetUserOidcConfigurations';

import CustomerOIDCConfiguration from './CustomerOIDCConfiguration';

jest.mock('../../../../../queries/RosaWizardQueries/useFetchGetUserOidcConfigurations', () => ({
  useFetchGetUserOidcConfigurations: jest.fn(),
  refetchGetUserOidcConfigurations: jest.fn(),
}));

const oidcData = {
  data: {
    items: [{ id: 'config1' }, { id: 'config2' }, { id: 'config3' }],
  },
};

const defaultProps = {
  onSelect: () => {},
  input: { value: '', onBlur: () => {} },
  meta: { error: undefined, touched: false },
};

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

describe('<CustomerOIDCConfiguration />', () => {
  jest.useFakeTimers({
    legacyFakeTimers: true, // TODO 'modern'
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const mockedUseFetchGetUserOidcConfigurations = useFetchGetUserOidcConfigurations;

  describe('Refresh OIDC data button', () => {
    it('is disabled and shows spinner when data is being fetched', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: undefined,
        isFetching: true,
        isSuccess: null,
      });

      render(buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />));

      expect(screen.getByRole('button', { name: 'Loading... Refresh' })).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides the spinner after oidc data is fetched and is not disabled', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: oidcData,
        isFetching: false,
        isSuccess: true,
      });

      render(buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Refresh/ })).not.toHaveAttribute(
          'aria-disabled',
        );
      });

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('OIDC config select ', () => {
    it('shows when oidc config data is being fetched', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: undefined,
        isFetching: true,
        isSuccess: null,
      });

      render(buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />));

      // Check while data is still loading
      expect(await screen.findByText(/No OIDC configurations found/i)).toBeInTheDocument();
    });

    it('is shown and disabled when no oidc configs are returned', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: undefined,
        isFetching: false,
        isSuccess: true,
      });

      render(buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />));

      expect(await screen.findByText(/No OIDC configurations found/i)).toBeInTheDocument();

      const selectDropdown = screen.getByRole('button', { name: 'Options menu' });

      await waitFor(() => {
        expect(selectDropdown).toBeDisabled();
      });
    });

    it('is refreshable when no oidc configs are returned', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: undefined,
        isFetching: false,
        isSuccess: true,
      });

      render(buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />));

      expect(await screen.findByText(/No OIDC configurations found/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Refresh/ })).not.toHaveAttribute(
          'aria-disabled',
        );
      });
    });

    it('shows search in select oidc config id dropdown', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: oidcData,
        isFetching: false,
        isSuccess: true,
      });

      const { user } = render(buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Refresh/ })).not.toHaveAttribute(
          'aria-disabled',
        );
      });

      expect(await screen.findByText(/select a config id/i)).toBeInTheDocument();

      const selectDropdown = screen.getByRole('button', { name: 'Options menu' });
      await user.click(selectDropdown);
      expect(await screen.findByPlaceholderText('Filter by config ID')).toBeInTheDocument();
    });
  });

  describe('Operator roles prefix', () => {
    beforeEach(() => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: oidcData,
        isFetching: false,
        isSuccess: true,
      });
    });

    it('renders correct description link when hypershift', async () => {
      const { user } = render(
        buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />, {
          [FieldId.Hypershift]: 'true',
        }),
      );

      const moreInfoBtn = await screen.findAllByLabelText('More information');
      await user.click(moreInfoBtn[1]);

      const link = screen.getByText('Defining a custom Operator IAM role prefix');
      expect(link).toHaveAttribute('href', links.ROSA_AWS_IAM_OPERATOR_ROLES);
    });

    it('renders correct description link when classic', async () => {
      const { user } = render(
        buildTestComponent(<CustomerOIDCConfiguration {...defaultProps} />, {
          [FieldId.Hypershift]: 'false',
        }),
      );

      const moreInfoBtn = await screen.findAllByLabelText('More information');
      await user.click(moreInfoBtn[1]);

      const link = screen.getByText('Defining a custom Operator IAM role prefix');
      expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES);
    });
  });

  describe('Create operator roles and rosa login commands', () => {
    const operatorRolesCommand = `rosa create operator-roles --prefix "hs1-l45w" --oidc-config-id "22qa79chsq8mand8h" --hosted-cp --installer-role-arn arn:aws:iam::269733:role/Installer-Role`;

    it('shows both commands when isMultiRegionEnabled', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: oidcData,
        isFetching: false,
        isSuccess: true,
      });

      const newProps = {
        ...defaultProps,
        isMultiRegionEnabled: true,
        operatorRolesCliCommand: operatorRolesCommand,
      };

      render(buildTestComponent(<CustomerOIDCConfiguration {...newProps} />));

      expect(
        await screen.findByText('Run the commands in order to create new Operator Roles.'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Copyable ROSA region login')).toBeInTheDocument();
      expect(await screen.findByText(operatorRolesCommand)).toBeInTheDocument();
    });

    it('shows only create operator roles command when isMultiRegionEnabled is false', async () => {
      mockedUseFetchGetUserOidcConfigurations.mockReturnValue({
        data: oidcData,
        isFetching: false,
        isSuccess: true,
      });

      const newProps = {
        ...defaultProps,
        isMultiRegionEnabled: false,
        operatorRolesCliCommand: operatorRolesCommand,
      };

      render(buildTestComponent(<CustomerOIDCConfiguration {...newProps} />));

      expect(
        await screen.findByText('Run the command to create new Operator Roles.'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Copyable ROSA region login')).not.toBeInTheDocument();
      expect(await screen.findByText(operatorRolesCommand)).toBeInTheDocument();
    });
  });
});
