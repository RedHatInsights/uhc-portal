import React from 'react';
import { Formik, useFormikContext } from 'formik';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { BILLING_CONTRACT_NOTIFICATION } from '~/queries/featureGates/featureConstants';
import { baseRequestState } from '~/redux/reduxHelpers';
import {
  mockUseChrome,
  mockUseFeatureGate,
  render,
  screen,
  UserEvent,
  waitFor,
  withState,
} from '~/testUtils';

import * as useClusterWizardResetStepsHook from '../hooks/useClusterWizardResetStepsHook';

import { FieldId, initialValues } from './constants';
import CreateROSAWizard, { CreateROSAWizardInternal } from './CreateROSAWizard';

const isWizardParentStepSpy = jest.spyOn(
  useClusterWizardResetStepsHook,
  'useClusterWizardResetStepsHook',
);

jest.mock('~/queries/ClusterDetailsQueries/useFetchActionsPermissions', () => ({
  useCanCreateManagedCluster: jest.fn(),
}));

jest.mock('~/queries/RosaWizardQueries/useIsNoConsoleRole', () => ({
  useIsNoConsoleRole: jest.fn(() => ({
    isNoConsoleRole: false,
    isPending: false,
    isError: false,
  })),
}));

jest.mock('./AccountsRolesScreen', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('./ClusterSettings/Details/Details', () => ({
  __esModule: true,
  default: () => <h2>Cluster details</h2>,
}));

// eslint-disable-next-line global-require
const MockAccountsRolesScreen: jest.Mock = require('./AccountsRolesScreen').default;

const MockAccountsRolesScreenImpl = ({
  onContractCheckChange,
  isContractDialogOpen,
  onContractDialogContinue,
  onContractDialogClose,
}: {
  onContractCheckChange: (hasWarning: boolean) => void;
  isContractDialogOpen: boolean;
  onContractDialogContinue: () => void;
  onContractDialogClose: () => void;
}) => {
  const { values, setFieldValue } = useFormikContext<Record<string, string>>();
  return (
    <div>
      <h1>AWS infrastructure account</h1>
      <button type="button" onClick={() => onContractCheckChange(true)}>
        Simulate contract warning
      </button>
      <button type="button" onClick={() => onContractCheckChange(false)}>
        Clear contract warning
      </button>
      <input
        aria-label="Billing account"
        value={values[FieldId.BillingAccountId] || ''}
        onChange={(e) => setFieldValue(FieldId.BillingAccountId, e.target.value)}
      />
      {isContractDialogOpen && (
        <div role="dialog" aria-label="Contract confirmation">
          <button type="button" onClick={onContractDialogContinue}>
            Continue with selection
          </button>
          <button type="button" onClick={onContractDialogClose}>
            Go back
          </button>
        </div>
      )}
    </div>
  );
};

describe('CreateROSAWizard', () => {
  it('is useClusterWizardResetStepsHook called', () => {
    // Act
    render(<CreateROSAWizard />);

    // Assert
    expect(isWizardParentStepSpy).toHaveBeenCalledWith({
      additionalCondition: true,
      additionalStepIndex: 5,
      currentStep: undefined,
      values: expect.any(Object),
      wizardContextRef: { current: undefined },
    });
  });
});

describe('CreateROSAWizardInternal contract-confirmation flow', () => {
  const baseWizardProps = {
    onActiveStepIdChange: jest.fn(),
    isHypershiftEnabled: false,
    isHcpLogForwardingEnabled: false,
    isHypershiftSelected: true,
    getOrganizationAndQuota: jest.fn(),
    organization: { fulfilled: true },
    machineTypes: { fulfilled: true, pending: false, error: false },
    cloudProviders: { fulfilled: true, pending: false, error: false },
    getMachineTypes: jest.fn(),
    getCloudProviders: jest.fn(),
    getInstallableVersionsResponse: { fulfilled: false },
    clearInstallableVersions: jest.fn(),
    getUserRoleResponse: { fulfilled: true, data: [] },
    createClusterResponse: { fulfilled: false, pending: false, error: false },
    getUserRole: jest.fn(),
    privateLinkSelected: false,
    installToVPCSelected: false,
    configureProxySelected: false,
    resetResponse: jest.fn(),
    closeDrawer: jest.fn(),
    isErrorModalOpen: false,
    openModal: jest.fn(),
    selectedAWSAccountID: '',
    createCluster: jest.fn(),
  };

  const reduxState = {
    rosaReducer: {
      getAWSAccountIDsResponse: { ...baseRequestState },
      getAWSAccountRolesARNsResponse: { ...baseRequestState },
      getOCMRoleResponse: { ...baseRequestState },
      getUserRoleResponse: { ...baseRequestState },
      getAWSBillingAccountsResponse: { ...baseRequestState },
    },
  };

  const buildWizard = (billingAccountId = '111', props = {}) => (
    <Formik
      initialValues={{ ...initialValues(true), [FieldId.BillingAccountId]: billingAccountId }}
      onSubmit={jest.fn()}
    >
      <CreateROSAWizardInternal {...baseWizardProps} {...props} />
    </Formik>
  );

  const nextButton = () => screen.getByTestId('wizard-next-button');
  const backButton = () => screen.getByTestId('wizard-back-button');
  const dialog = () => screen.queryByRole('dialog', { name: 'Contract confirmation' });

  const clickNext = async (user: UserEvent) => {
    await waitFor(() => expect(nextButton()).not.toBeDisabled());
    await user.click(nextButton());
  };

  beforeEach(() => {
    MockAccountsRolesScreen.mockImplementation(MockAccountsRolesScreenImpl);
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({ canCreateManagedCluster: true });
    mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);
    mockUseChrome({ analytics: { track: jest.fn() } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('advances directly to the next step, without opening the dialog, when there is no contract warning', async () => {
    // Arrange
    const { user } = withState(reduxState).render(buildWizard());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });

    // Act
    await clickNext(user);

    // Assert
    expect(dialog()).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Cluster details' })).toBeInTheDocument();
  });

  it('opens the contract-confirmation dialog on "Next" once a contract warning is flagged', async () => {
    // Arrange
    const { user } = withState(reduxState).render(buildWizard());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });
    await user.click(screen.getByText('Simulate contract warning'));

    // Act
    await clickNext(user);

    // Assert: onRequestContractConfirmation set isContractDialogOpen, without navigating yet
    expect(dialog()).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AWS infrastructure account' })).toBeInTheDocument();
  });

  it('continuing from the dialog closes it, marks the account confirmed, and advances via goToNextStep', async () => {
    // Arrange
    const { user } = withState(reduxState).render(buildWizard());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });
    await user.click(screen.getByText('Simulate contract warning'));
    await clickNext(user);
    expect(dialog()).toBeInTheDocument();

    // Act: handleContractDialogContinue
    await user.click(screen.getByText('Continue with selection'));

    // Assert
    expect(dialog()).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Cluster details' })).toBeInTheDocument();
  });

  it('closing the dialog (handleContractDialogClose) hides it without advancing the wizard', async () => {
    // Arrange
    const { user } = withState(reduxState).render(buildWizard());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });
    await user.click(screen.getByText('Simulate contract warning'));
    await clickNext(user);
    expect(dialog()).toBeInTheDocument();

    // Act: handleContractDialogClose
    await user.click(screen.getByText('Go back'));

    // Assert
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'AWS infrastructure account' })).toBeInTheDocument();
  });

  it('does not re-prompt for confirmation when returning to the same, already-confirmed billing account', async () => {
    // Arrange
    const { user } = withState(reduxState).render(buildWizard());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });
    await user.click(screen.getByText('Simulate contract warning'));
    await clickNext(user);
    await user.click(screen.getByText('Continue with selection'));
    await screen.findByRole('heading', { name: 'Cluster details' });

    // Act: go back to Accounts and roles, then advance again without changing the selection
    await user.click(backButton());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });
    await clickNext(user);

    // Assert
    expect(dialog()).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Cluster details' })).toBeInTheDocument();
  });

  it('re-prompts for confirmation when the billing account selection changes after a previous confirmation', async () => {
    // Arrange
    const { user } = withState(reduxState).render(buildWizard());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });
    await user.click(screen.getByText('Simulate contract warning'));
    await clickNext(user);
    await user.click(screen.getByText('Continue with selection'));
    await screen.findByRole('heading', { name: 'Cluster details' });
    await user.click(backButton());
    await screen.findByRole('heading', { name: 'AWS infrastructure account' });

    // Act: change the billing account selection (triggers the render-time reset of
    // confirmedBillingAccountId), then advance
    await user.clear(screen.getByLabelText('Billing account'));
    await user.type(screen.getByLabelText('Billing account'), '222');
    await clickNext(user);

    // Assert
    expect(dialog()).toBeInTheDocument();
  });
});
