import React from 'react';

import { useWizardContext } from '@patternfly/react-core';

import { checkAccessibility, render, screen } from '~/testUtils';

import { BackToAssociateAwsAccountLink } from './BackToAssociateAwsAccountLink';

jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: jest.fn(),
}));

const EXPECTED_STEP_ID = 1;

jest.mock('~/components/clusters/wizards/rosa/rosaWizardConstants', () => ({
  getAccountAndRolesStepId: jest.fn().mockReturnValue(EXPECTED_STEP_ID),
}));

describe('<BackToAssociateAwsAccountLink />', () => {
  // Arrange
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders component with expected text and verifies expected functionality on a button click', async () => {
    // Arrange
    const goToStepById = jest.fn();
    useWizardContext.mockReturnValue({
      goToStepById,
    });

    // Act
    const { user } = render(<BackToAssociateAwsAccountLink />);

    // Assert
    const btn = screen.getByText('Back to associate AWS account');
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(goToStepById).toHaveBeenCalledWith(EXPECTED_STEP_ID);
  });

  it('is accessible', async () => {
    // Arrange
    // Act
    const { container } = render(<BackToAssociateAwsAccountLink />);
    // Assert
    await checkAccessibility(container);
  });
});
