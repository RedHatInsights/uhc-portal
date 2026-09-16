import React from 'react';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { emptyQuotaList } from '~/components/clusters/common/__tests__/quota.fixtures';
import { render, screen, withState } from '~/testUtils';

import * as useClusterWizardResetStepsHook from '../hooks/useClusterWizardResetStepsHook';

import { CreateOsdWizard } from './CreateOsdWizard';

// Prevent real redux thunks from firing on mount; the org/quota/persistent-storage/load-balancer
// state used by these tests is already fulfilled via preloaded redux state.
jest.mock('~/redux/actions/userActions', () => ({
  ...jest.requireActual('~/redux/actions/userActions'),
  getOrganizationAndQuota: jest.fn(() => ({ type: 'NOOP' })),
}));
jest.mock('~/redux/actions/persistentStorageActions', () => jest.fn(() => ({ type: 'NOOP' })));
jest.mock('~/redux/actions/loadBalancerActions', () => jest.fn(() => ({ type: 'NOOP' })));

const isWizardParentStepSpy = jest.spyOn(
  useClusterWizardResetStepsHook,
  'useClusterWizardResetStepsHook',
);

const fulfilledState = {
  userProfile: {
    organization: {
      fulfilled: true,
      pending: false,
      quotaList: emptyQuotaList,
    },
  },
  loadBalancerValues: { fulfilled: true, pending: false },
  persistentStorageValues: { fulfilled: true, pending: false },
};

describe('CreateOsdWizard', () => {
  it('is useClusterWizardResetStepsHook called', () => {
    // Act
    render(<CreateOsdWizard />);

    // Assert
    expect(isWizardParentStepSpy).toHaveBeenCalledWith({
      currentStep: undefined,
      values: expect.any(Object),
      wizardContextRef: { current: undefined },
    });
  });

  it('renders the wizard for OSD even when the org has no quota at all, since On-Demand GCP Marketplace never requires quota', () => {
    withState(fulfilledState, true).render(<CreateOsdWizard />);

    expect(screen.getByText('Welcome to Red Hat OpenShift Dedicated')).toBeInTheDocument();
  });

  it('renders the OSD Trial wizard even when the org has no quota at all, since it falls back to OSD (which always has On-Demand GCP Marketplace)', () => {
    withState(fulfilledState, true).render(
      <CreateOsdWizard product={normalizedProducts.OSDTrial} />,
    );

    expect(screen.getByText('Welcome to Red Hat OpenShift Dedicated')).toBeInTheDocument();
  });
});
