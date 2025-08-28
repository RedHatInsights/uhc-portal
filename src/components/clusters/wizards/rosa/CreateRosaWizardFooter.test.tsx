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
  const mockedUseFormState = useFormState as jest.Mock;

  const useFormStateReturnValue = {
    setFieldTouched: jest.fn(),
    setFieldValue: jest.fn(),
    getFieldProps: jest.fn(),
    getFieldMeta: jest.fn().mockReturnValue({}),
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
});
