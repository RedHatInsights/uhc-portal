import React from 'react';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import {
  BILLING_CONTRACT_NOTIFICATION,
  OCM_ROLE_NO_CONSOLE,
} from '~/queries/featureGates/featureConstants';
import * as useFetchGetOCMRoleModule from '~/queries/RosaWizardQueries/useFetchGetOCMRole';
import { mockUseFeatureGate, mockUseFormState, render, screen } from '~/testUtils';

import { FieldId } from './constants';
import CreateRosaWizardFooter from './CreateRosaWizardFooter';
import { stepId } from './rosaWizardConstants';

jest.mock('~/components/clusters/wizards/hooks/useFormState');

jest.mock('react-redux', () => ({
  __esModule: true,
  ...jest.requireActual('react-redux'),
  useSelector: () => ({
    data: {},
    fulfilled: true,
    pending: false,
    error: false,
  }),
}));

jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: jest.fn(() => ({
    goToNextStep: jest.fn(),
    goToPrevStep: jest.fn(),
    close: jest.fn(),
    activeStep: { id: 'mockStepId' },
    steps: [],
    setStep: jest.fn(),
    goToStepById: jest.fn(),
  })),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

const wizardPrimaryBtnTestId = 'wizard-next-button';

describe('<CreateRosaWizardFooter />', () => {
  const props = {
    accountAndRolesStepId: 'mockStepId',
    getUserRoleResponse: {},
    getUserRoleInfo: jest.fn(),
    onWizardContextChange: jest.fn(),
  };

  beforeEach(() => {
    mockUseFormState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Disables "Next" button if user has no permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    render(<CreateRosaWizardFooter {...props} />);
    expect(screen.getByTestId(wizardPrimaryBtnTestId)).toHaveAttribute('disabled');
  });

  it('Enables "Next" button if user has permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<CreateRosaWizardFooter {...props} />);
    expect(screen.getByTestId(wizardPrimaryBtnTestId)).not.toHaveAttribute('aria-disabled');
  });

  describe('contract nudge confirmation', () => {
    // The confirmation dialog itself is rendered by AWSBillingAccount; the footer is only
    // responsible for intercepting "Next" and requesting confirmation instead of advancing.
    const mockGoToNextStep = jest.fn();
    const onRequestContractConfirmation = jest.fn();

    const accountsStepProps = {
      ...props,
      accountAndRolesStepId: String(stepId.ACCOUNTS_AND_ROLES_AS_FIRST_STEP),
      currentStepId: String(stepId.ACCOUNTS_AND_ROLES_AS_FIRST_STEP),
      getUserRoleResponse: { fulfilled: true },
      onValidNextStep: jest.fn(),
      onRequestContractConfirmation,
    };

    beforeEach(() => {
      (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
        canCreateManagedCluster: true,
      });
      jest.spyOn(useFetchGetOCMRoleModule, 'useFetchGetOCMRole').mockReturnValue({
        data: { profile: 'standard' },
        isSuccess: true,
        isPending: false,
        isError: false,
        error: null,
        status: 'success',
      });
      jest.mocked(jest.requireMock('@patternfly/react-core').useWizardContext).mockReturnValue({
        goToNextStep: mockGoToNextStep,
        goToPrevStep: jest.fn(),
        close: jest.fn(),
        activeStep: { id: stepId.ACCOUNTS_AND_ROLES_AS_FIRST_STEP },
        steps: [],
        setStep: jest.fn(),
        goToStepById: jest.fn(),
      });
      mockUseFormState({
        values: { [FieldId.BillingAccountId]: '123456789012' },
        validateForm: jest.fn().mockResolvedValue({}),
        isValidating: false,
      });
    });

    it('requests contract confirmation instead of advancing when trigger condition is met', async () => {
      mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);

      const { user } = render(<CreateRosaWizardFooter {...accountsStepProps} hasContractWarning />);

      await user.click(screen.getByTestId(wizardPrimaryBtnTestId));

      expect(onRequestContractConfirmation).toHaveBeenCalled();
      expect(mockGoToNextStep).not.toHaveBeenCalled();
    });

    it('advances to next step directly when feature gate is disabled', async () => {
      mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, false]]);

      const { user } = render(<CreateRosaWizardFooter {...accountsStepProps} hasContractWarning />);

      await user.click(screen.getByTestId(wizardPrimaryBtnTestId));

      expect(onRequestContractConfirmation).not.toHaveBeenCalled();
      expect(mockGoToNextStep).toHaveBeenCalled();
    });

    it('advances to next step directly when hasContractWarning is false', async () => {
      mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);

      const { user } = render(
        <CreateRosaWizardFooter {...accountsStepProps} hasContractWarning={false} />,
      );

      await user.click(screen.getByTestId(wizardPrimaryBtnTestId));

      expect(onRequestContractConfirmation).not.toHaveBeenCalled();
      expect(mockGoToNextStep).toHaveBeenCalled();
    });
  });

  describe('no_console role on Review and create step', () => {
    const reviewStepProps = {
      ...props,
      currentStepId: String(stepId.REVIEW_AND_CREATE),
    };

    beforeEach(() => {
      jest.mocked(jest.requireMock('@patternfly/react-core').useWizardContext).mockReturnValue({
        goToNextStep: jest.fn(),
        goToPrevStep: jest.fn(),
        close: jest.fn(),
        activeStep: { id: stepId.REVIEW_AND_CREATE },
        steps: [],
        setStep: jest.fn(),
        goToStepById: jest.fn(),
      });
      (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
        canCreateManagedCluster: true,
      });
    });

    it('disables "Create cluster" button when no_console role is detected', () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      jest.spyOn(useFetchGetOCMRoleModule, 'useFetchGetOCMRole').mockReturnValue({
        data: { profile: 'no_console' },
        isSuccess: true,
        isPending: false,
        isError: false,
        error: null,
        status: 'success',
      });

      render(<CreateRosaWizardFooter {...reviewStepProps} />);

      expect(screen.getByTestId(wizardPrimaryBtnTestId)).toBeDisabled();
    });

    it('enables "Create cluster" button when OCM role has console permissions', () => {
      mockUseFeatureGate([[OCM_ROLE_NO_CONSOLE, true]]);
      jest.spyOn(useFetchGetOCMRoleModule, 'useFetchGetOCMRole').mockReturnValue({
        data: { profile: 'standard' },
        isSuccess: true,
        isPending: false,
        isError: false,
        error: null,
        status: 'success',
      });

      render(<CreateRosaWizardFooter {...reviewStepProps} />);

      expect(screen.getByTestId(wizardPrimaryBtnTestId)).not.toBeDisabled();
    });
  });
});
