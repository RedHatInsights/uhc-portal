import React from 'react';
import { Formik } from 'formik';

import { getQueryParam } from '~/common/queryHelpers';
import { useIsOSDFromGoogleCloud } from '~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud';
import { checkAccessibility, mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';

import { initialValues } from '../constants';

import { BillingModel } from './BillingModel';
import { useGetBillingQuotas } from './useGetBillingQuotas';

// Mock hooks
jest.mock('~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud');
jest.mock('~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas');
jest.mock('~/common/queryHelpers');

const mockGetQueryParam = getQueryParam as jest.Mock;
const mockUseIsOSDFromGoogleCloud = useIsOSDFromGoogleCloud as jest.Mock;
const mockUseGetBillingQuotas = useGetBillingQuotas as jest.Mock;

const defaultQuotas = {
  osdTrial: true,
  standardOsd: true,
  marketplace: true,
  gcpResources: true,
  rhInfra: true,
  byoc: true,
  marketplaceRhInfra: true,
  marketplaceByoc: true,
};

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
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([]);
    mockUseGetBillingQuotas.mockReturnValue(defaultQuotas);
  });
  describe('Default path for osd creation', () => {
    beforeEach(() => {
      mockUseIsOSDFromGoogleCloud.mockReturnValue(false);
    });

    it('is accessible', async () => {
      const { container } = render(buildTestComponent());
      await checkAccessibility(container);
    });
    it('displays all three subscription type options', () => {
      render(buildTestComponent());

      expect(screen.getByText('Free trial (upgradeable)')).toBeInTheDocument();
      expect(
        screen.getByText('Annual: Fixed capacity subscription from Red Hat'),
      ).toBeInTheDocument();
      expect(screen.getByText(/On-Demand: Flexible usage billed through/i)).toBeInTheDocument();
    });

    it('displays both infrastructure type options', () => {
      render(buildTestComponent());

      expect(screen.getByText('Customer cloud subscription')).toBeInTheDocument();
      expect(screen.getByText('Red Hat cloud account')).toBeInTheDocument();
    });

    it('hides trial option when quotas.osdTrial is false', () => {
      mockUseGetBillingQuotas.mockReturnValue({
        ...defaultQuotas,
        osdTrial: false,
      });

      render(buildTestComponent());

      expect(screen.queryByText('Free trial (upgradeable)')).not.toBeInTheDocument();
    });

    it('has customer cloud subscription selected by default', () => {
      render(buildTestComponent());
      const byocRadioCCSOption = screen.getByRole('radio', {
        name: /customer cloud subscription/i,
      });
      expect(byocRadioCCSOption).toBeInTheDocument();
      expect(byocRadioCCSOption).toBeChecked();
    });
  });

  describe('When creating a cluster coming from google cloud console', () => {
    beforeEach(() => {
      mockUseIsOSDFromGoogleCloud.mockReturnValue(true);
      mockGetQueryParam.mockReturnValue('gcp');
      mockUseGetBillingQuotas.mockReturnValue({
        ...defaultQuotas,
        standardOsd: false,
      });
    });
    it('is accessible', async () => {
      const { container } = render(buildTestComponent());
      await checkAccessibility(container);
    });
    it('does not display free trial option', () => {
      render(buildTestComponent());

      expect(screen.queryByText('Free trial (upgradeable)')).not.toBeInTheDocument();
    });

    it('does not display annual subscription option', () => {
      render(buildTestComponent());

      expect(
        screen.queryByText('Annual: Fixed capacity subscription from Red Hat'),
      ).not.toBeInTheDocument();
    });

    it('displays only on-demand marketplace option', () => {
      render(buildTestComponent());

      expect(screen.getByText(/On-Demand: Flexible usage billed through/i)).toBeInTheDocument();
    });

    it('has On-Demand selected by default', async () => {
      render(buildTestComponent());
      const onDemandRadioOption = screen.getByRole('radio', {
        name: /On-Demand: Flexible usage billed through/i,
      });
      expect(onDemandRadioOption).toBeInTheDocument();

      // Wait for the useEffect to update the billing model
      await waitFor(() => {
        expect(onDemandRadioOption).toBeChecked();
      });
    });

    it('displays only customer cloud subscription infrastructure option', () => {
      render(buildTestComponent());

      expect(screen.getByText('Customer cloud subscription')).toBeInTheDocument();
      expect(screen.queryByText('Red Hat cloud account')).not.toBeInTheDocument();
    });
    it('has customer cloud subscription selected by default', () => {
      render(buildTestComponent());
      const byocRadioCCSOption = screen.getByRole('radio', {
        name: /customer cloud subscription/i,
      });
      expect(byocRadioCCSOption).toBeInTheDocument();
      expect(byocRadioCCSOption).toBeChecked();
    });
  });
  describe('Google Cloud Marketplace', () => {
    it('Google Cloud Marketplace option is enabled when there is gcp quota', async () => {
      mockUseGetBillingQuotas.mockReturnValue({
        gcpResources: true,
      });

      render(buildTestComponent());

      expect(
        screen.queryByRole('radio', { name: /On-Demand: Flexible usage billed through/i }),
      ).toBeEnabled();
    });

    it('Google Cloud Marketplace option is disabled when there is no gcp quota', async () => {
      mockUseGetBillingQuotas.mockReturnValue({
        gcpResources: false,
      });

      render(buildTestComponent());

      expect(
        screen.queryByRole('radio', { name: /On-Demand: Flexible usage billed through/i }),
      ).toBeDisabled();
    });

    it('Shows enabled description when there is gcp quota', async () => {
      mockUseGetBillingQuotas.mockReturnValue({
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
      mockUseGetBillingQuotas.mockReturnValue({
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
