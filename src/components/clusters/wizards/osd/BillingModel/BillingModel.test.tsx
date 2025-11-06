import React from 'react';
import { Formik } from 'formik';

import { useIsOSDFromGoogleCloud } from '~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import { initialValues } from '../constants';

import { BillingModel } from './BillingModel';
import { useGetBillingQuotas } from './useGetBillingQuotas';

// Mock hooks
jest.mock('~/components/clusters/wizards/osd/useIsOSDFromGoogleCloud');
jest.mock('~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas');

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

  describe('when useIsOSDFromGoogleCloud returns false', () => {
    beforeEach(() => {
      mockUseIsOSDFromGoogleCloud.mockReturnValue(false);
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

    it('has customer cloud subscription selected by default', () => {
      const { container } = render(buildTestComponent());
      const byocRadioCCSOption = container.querySelector('#form-radiobutton-byoc-true-field');
      expect(byocRadioCCSOption).toBeInTheDocument();
      expect(byocRadioCCSOption).toHaveAttribute('checked');
    });

    it('hides trial option when quotas.osdTrial is false', () => {
      mockUseGetBillingQuotas.mockReturnValue({
        ...defaultQuotas,
        osdTrial: false,
      });

      render(buildTestComponent());

      expect(screen.queryByText('Free trial (upgradeable)')).not.toBeInTheDocument();
    });
  });

  describe('when useIsOSDFromGoogleCloud returns true', () => {
    beforeEach(() => {
      mockUseIsOSDFromGoogleCloud.mockReturnValue(true);
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

    it('displays only customer cloud subscription infrastructure option', () => {
      render(buildTestComponent());

      expect(screen.getByText('Customer cloud subscription')).toBeInTheDocument();
      expect(screen.queryByText('Red Hat cloud account')).not.toBeInTheDocument();
    });
  });
});
