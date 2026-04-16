import React from 'react';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { useGetBillingQuotas } from '~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { mockUseFormState, render, screen } from '~/testUtils';
import { SubscriptionCommonFieldsCluster_billing_model as BillingModel } from '~/types/accounts_mgmt.v1';

import { CloudProviderStepFooter } from './CloudProviderStepFooter';

jest.mock('~/components/clusters/wizards/osd/BillingModel/useGetBillingQuotas');
jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions');

jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: jest.fn(() => ({
    goToNextStep: jest.fn(),
    goToPrevStep: jest.fn(),
    close: jest.fn(),
    activeStep: { id: 'cluster-settings-cloud-provider' },
    steps: [],
    setStep: jest.fn(),
    goToStepById: jest.fn(),
  })),
}));

const wizardNextTestId = 'wizard-next-button';

const baseValues = {
  [FieldId.Product]: normalizedProducts.OSD,
  [FieldId.BillingModel]: BillingModel.standard,
  [FieldId.Byoc]: 'true',
};

describe('<CloudProviderStepFooter />', () => {
  describe('Next button', () => {
    beforeEach(() => {
      (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
        canCreateManagedCluster: true,
      });
      mockUseFormState({
        values: {
          ...baseValues,
          [FieldId.CloudProvider]: CloudProviderType.Gcp,
        },
        validateForm: jest.fn().mockResolvedValue({}),
        setTouched: jest.fn(),
        submitForm: jest.fn(),
        isValidating: false,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('disables Next when there is no GCP resources and cloud provider is GCP', () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: false,
      });

      render(<CloudProviderStepFooter onWizardContextChange={jest.fn()} />);

      expect(screen.getByTestId(wizardNextTestId)).toHaveAttribute('disabled');
    });

    it('enables Next when GCP resources are available and cloud provider is GCP', () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: true,
      });

      render(<CloudProviderStepFooter onWizardContextChange={jest.fn()} />);

      expect(screen.getByTestId(wizardNextTestId)).not.toHaveAttribute('disabled');
    });

    it('enables Next when there is no GCP resources but billing is Google Cloud Marketplace', () => {
      (useGetBillingQuotas as jest.Mock).mockReturnValue({
        gcpResources: false,
      });

      mockUseFormState({
        values: {
          ...baseValues,
          [FieldId.BillingModel]: BillingModel.marketplace_gcp,
          [FieldId.CloudProvider]: CloudProviderType.Gcp,
        },
        validateForm: jest.fn().mockResolvedValue({}),
        setTouched: jest.fn(),
        submitForm: jest.fn(),
        isValidating: false,
      });

      render(<CloudProviderStepFooter onWizardContextChange={jest.fn()} />);

      expect(screen.getByTestId(wizardNextTestId)).not.toHaveAttribute('disabled');
    });
  });
});
