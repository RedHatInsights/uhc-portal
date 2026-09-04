import React from 'react';

import { render } from '~/testUtils';

import * as useClusterWizardResetStepsHook from '../hooks/useClusterWizardResetStepsHook';

import CreateROSAWizard from './CreateROSAWizard';

const isWizardParentStepSpy = jest.spyOn(
  useClusterWizardResetStepsHook,
  'useClusterWizardResetStepsHook',
);

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
