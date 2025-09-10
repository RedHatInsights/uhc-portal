import React from 'react';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { render, screen } from '~/testUtils';

import { CreateOsdWizardFooter } from './CreateOsdWizardFooter';

jest.mock('~/components/clusters/wizards/hooks/useFormState');

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

describe('<CreateOsdWizardFooter />', () => {
  const mockedUseFormState = useFormState as jest.Mock;
  const mockOnNext = jest.fn();

  const useFormStateReturnValue = {
    isValidating: false,
    submitForm: jest.fn(),
    setTouched: jest.fn(),
    validateForm: jest.fn(),
    values: {},
  };

  const props = {
    onNext: mockOnNext,
    onWizardContextChange: jest.fn(),
    isLoadding: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Disables "Next" button if user has no permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: false,
    });
    mockedUseFormState.mockReturnValue(useFormStateReturnValue);
    render(<CreateOsdWizardFooter {...props} />);
    expect(screen.getByTestId(wizardPrimaryBtnTestId)).toHaveAttribute('disabled');
  });

  it('Enables "Next" button if user has permissions to create a managed cluster', async () => {
    (useCanCreateManagedCluster as jest.Mock).mockReturnValue({
      canCreateManagedCluster: true,
    });
    render(<CreateOsdWizardFooter {...props} />);
    expect(screen.getByTestId(wizardPrimaryBtnTestId)).not.toHaveAttribute('aria-disabled');
  });

  it("Doesn't proceed to the next step when validation fails", () => {
    mockedUseFormState.mockReturnValue({
      ...useFormStateReturnValue,
      validateForm: jest.fn().mockResolvedValue({ mockError: 'Mock Error' }),
    });

    const { user } = render(<CreateOsdWizardFooter {...props} />);
    const nextButton = screen.getByTestId(wizardPrimaryBtnTestId);

    user.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('Proceeds to the next step when validation succeeds', async () => {
    mockedUseFormState.mockReturnValue({
      ...useFormStateReturnValue,
      validateForm: jest.fn().mockResolvedValue({}),
    });

    const { user } = render(<CreateOsdWizardFooter {...props} />);
    const nextButton = screen.getByTestId(wizardPrimaryBtnTestId);

    await user.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });
});
