import React from 'react';

import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { mockUseFormState, render, screen } from '~/testUtils';

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
});
