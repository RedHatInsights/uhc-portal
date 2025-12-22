import React from 'react';
import { Formik } from 'formik';

import { mockUseFormState, render, screen } from '~/testUtils';

import EditClusterWideProxyForm from './EditClusterWideProxyForm';

jest.mock('~/components/clusters/wizards/hooks/useFormState');

jest.mock('~/components/common/ReduxFormComponents_deprecated/ReduxFileUpload', () => () => (
  <div>MOCKED UPLOAD TEXT AREA</div>
));

describe('<EditClusterWideProxyForm />', () => {
  const defaultInitialValues = {
    http_proxy_url: undefined,
    https_proxy_url: undefined,
    no_proxy_domains: undefined,
    additional_trust_bundle: undefined,
  };

  const defaultProps = {
    isClusterEditError: false,
    clusterEditError: {},
    isClusterEditPending: false,
    submitForm: jest.fn(),
    handleClose: jest.fn(),
  };

  const proxyErrorProps = {
    isClusterEditError: true,
    clusterEditError: {
      errorMessage:
        'CLUSTERS-MGMT-400: expected a valid user no-proxy value: \'f.g\' should match the regular expression ^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\\/(3[0-2]|[1-2][0-9]|[0-9]))$|^(.?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$|^""$. For example: domain.example.com, 10.0.0.12, 10.0.0.0/24, .example.com',
    },
    isClusterEditPending: false,
    submitForm: jest.fn(),
    handleClose: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('additional trust bundle', () => {
    it('shows text area if no trust bundle is loaded', async () => {
      mockUseFormState({ values: { ...defaultInitialValues } });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditClusterWideProxyForm {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByText('MOCKED UPLOAD TEXT AREA')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Replace file' })).not.toBeInTheDocument();
    });

    it('shows "replace file" link instead of text area if trust bundle is loaded', async () => {
      mockUseFormState({
        values: { ...defaultInitialValues, additional_trust_bundle: 'I am a trust bundle' },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditClusterWideProxyForm {...defaultProps} />
        </Formik>,
      );

      expect(await screen.findByRole('button', { name: 'Replace file' })).toBeInTheDocument();
      expect(screen.queryByText('MOCKED UPLOAD TEXT AREA')).not.toBeInTheDocument();
    });

    it('shows text area when "replace file" link is clicked', async () => {
      mockUseFormState({
        values: { ...defaultInitialValues, additional_trust_bundle: 'I am a trust bundle' },
      });
      const { user } = render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditClusterWideProxyForm {...defaultProps} />
        </Formik>,
      );

      await user.click(screen.getByRole('button', { name: 'Replace file' }));
      expect(await screen.findByText('MOCKED UPLOAD TEXT AREA')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Replace file' })).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays the correct error message when cluster-wide proxy editing fails', async () => {
      mockUseFormState({ values: { ...defaultInitialValues } });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditClusterWideProxyForm {...proxyErrorProps} />
        </Formik>,
      );

      expect(
        await screen.findByText(/CLUSTERS-MGMT-400: expected a valid user no-proxy value/),
      ).toBeInTheDocument();
    });
  });
});
