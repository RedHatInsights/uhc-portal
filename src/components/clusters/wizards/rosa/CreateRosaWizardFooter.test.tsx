import React from 'react';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import CreateRosaWizardFooter from './CreateRosaWizardFooter';

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

const mockGoToNextStep = jest.fn();

jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: jest.fn(() => ({
    goToNextStep: mockGoToNextStep,
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
  const mockedUseFormState = useFormState as jest.Mock;

  const useFormStateReturnValue = {
    isValidating: false,
    submitForm: jest.fn(),
    setTouched: jest.fn(),
    validateForm: jest.fn(),
    values: {},
  };

  const props = {
    accountAndRolesStepId: 'mockStepId',
    getUserRoleResponse: {},
    getUserRoleInfo: jest.fn(),
    onWizardContextChange: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Disables "Next" button if user has no permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    mockedUseFormState.mockReturnValue(useFormStateReturnValue);
    render(<CreateRosaWizardFooter {...props} />);
    expect(screen.getByTestId(wizardPrimaryBtnTestId)).toHaveAttribute('disabled');
  });

  it('Enables "Next" button if user has permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    mockedUseFormState.mockReturnValue(useFormStateReturnValue);
    render(<CreateRosaWizardFooter {...props} />);
    expect(screen.getByTestId(wizardPrimaryBtnTestId)).not.toHaveAttribute('aria-disabled');
  });

  it("Doesn't proceed to the next step when validation fails", () => {
    mockedUseFormState.mockReturnValue({
      ...useFormStateReturnValue,
      validateForm: jest.fn().mockResolvedValue({ mockError: 'Mock Error' }),
    });

    const { user } = render(<CreateRosaWizardFooter {...props} />);
    const nextButton = screen.getByTestId(wizardPrimaryBtnTestId);

    user.click(nextButton);
    expect(mockGoToNextStep).not.toHaveBeenCalled();
  });

  it('Proceeds to the next step when validation succeeds', async () => {
    mockedUseFormState.mockReturnValue({
      ...useFormStateReturnValue,
      validateForm: jest.fn().mockResolvedValue({}),
    });

    const { user } = render(<CreateRosaWizardFooter {...props} />);
    const nextButton = screen.getByTestId(wizardPrimaryBtnTestId);

    await user.click(nextButton);
    expect(mockGoToNextStep).toHaveBeenCalled();
  });
});
