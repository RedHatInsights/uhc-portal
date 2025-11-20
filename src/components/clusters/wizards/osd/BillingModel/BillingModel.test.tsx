import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';

import { initialValues } from '../constants';

import { BillingModel } from './BillingModel';
import { useGetBillingQuotas } from './useGetBillingQuotas';

jest.mock('~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas', () => ({
  useGetBillingQuotas: jest.fn(),
}));

(useGetBillingQuotas as jest.Mock).mockReturnValue({
  OsdTrial: true,
});

const buildTestComponent = () => (
  <Formik
    initialValues={{
      ...initialValues,
    }}
    initialTouched={{}}
    onSubmit={() => {}}
  >
    <BillingModel />
  </Formik>
);

describe('<BillingModel />', () => {
  describe('check initial state', () => {
    it('is default infrastructure type ok?', () => {
      const { container } = render(buildTestComponent());
      const byocRadioCCSOption = container.querySelector('#form-radiobutton-byoc-true-field');
      expect(byocRadioCCSOption).toBeInTheDocument();
      expect(byocRadioCCSOption).toHaveAttribute('checked');
    });
  });
  describe('Google Cloud Marketplace', () => {
    it('Google Cloud Marketplace option is enabled when there is gcp quota', async () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: true,
      });

      render(buildTestComponent());

      expect(
        screen.queryByRole('radio', { name: /On-Demand: Flexible usage billed through/i }),
      ).toBeEnabled();
    });

    it('Google Cloud Marketplace option is disabled when there is no gcp quota', async () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: false,
      });

      render(buildTestComponent());

      expect(
        screen.queryByRole('radio', { name: /On-Demand: Flexible usage billed through/i }),
      ).toBeDisabled();
    });

    it('Shows enabled description when there is gcp quota', async () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: true,
      });

      render(buildTestComponent());

      expect(
        screen.getByText(
          'Use Google Cloud Marketplace to subscribe and pay based on the services you use',
        ),
      ).toBeInTheDocument();
    });

    it('Shows disabled description when there is no gcp quota', async () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: false,
      });
      render(buildTestComponent());

      expect(
        screen.getByText('You do not currently have a Google Cloud Platform subscription'),
      ).toBeInTheDocument();
      expect(screen.getByText('How can I purchase a subscription?')).toBeInTheDocument();
    });
  });
});
