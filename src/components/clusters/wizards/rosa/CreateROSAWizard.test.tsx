import React from 'react';
import { Formik } from 'formik';

import { trackEvents } from '~/common/analytics';
import { SpotInterruptionMode } from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { mockUseChrome, render, screen } from '~/testUtils';

import * as useClusterWizardResetStepsHook from '../hooks/useClusterWizardResetStepsHook';

import { FieldId, initialValues } from './constants';
import CreateROSAWizard, { CreateROSAWizardInternal } from './CreateROSAWizard';
import { stepId } from './rosaWizardConstants';

const isWizardParentStepSpy = jest.spyOn(
  useClusterWizardResetStepsHook,
  'useClusterWizardResetStepsHook',
);

jest.mock('./CreateRosaWizardFooter', () => ({
  __esModule: true,
  default: jest.fn((props) => {
    const ActualFooter = jest.requireActual('./CreateRosaWizardFooter').default;
    return <ActualFooter {...props} />;
  }),
}));

const MockCreateRosaWizardFooter: jest.Mock = require('./CreateRosaWizardFooter').default;

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

describe('CreateROSAWizardInternal analytics', () => {
  const trackMock = jest.fn();
  const sqsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot';

  const analyticsWizardProps = {
    onActiveStepIdChange: jest.fn(),
    isHypershiftEnabled: true,
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

  beforeEach(() => {
    mockUseChrome({ analytics: { track: trackMock } });
    MockCreateRosaWizardFooter.mockImplementation(({ onValidNextStep }) => (
      <button
        type="button"
        data-testid="trigger-valid-next-step"
        onClick={() => onValidNextStep(stepId.CLUSTER_SETTINGS__MACHINE_POOL)}
      >
        Trigger valid next step
      </button>
    ));
  });

  afterEach(() => {
    trackMock.mockClear();
    MockCreateRosaWizardFooter.mockImplementation((props) => {
      const ActualFooter = jest.requireActual('./CreateRosaWizardFooter').default;
      return <ActualFooter {...props} />;
    });
  });

  it('tracks SqsQueueUrlConfigured when leaving the machine pool step with an enhanced SQS queue URL', async () => {
    const { user } = render(
      <Formik
        initialValues={{
          ...initialValues(true),
          [FieldId.SpotInterruptionHandling]: SpotInterruptionMode.Enhanced,
          [FieldId.SpotTerminationHandlerQueueUrl]: sqsQueueUrl,
        }}
        onSubmit={jest.fn()}
      >
        <CreateROSAWizardInternal {...analyticsWizardProps} />
      </Formik>,
    );

    await user.click(screen.getByTestId('trigger-valid-next-step'));

    expect(trackMock).toHaveBeenCalledWith(
      trackEvents.SqsQueueUrlConfigured.event,
      expect.objectContaining({
        context: 'cluster_creation',
        sqs_queue_url: 'https://sqs.us-east-1.amazonaws.com/xxxxxxxxxxxx/rosa-cluster-spot',
        link_name: trackEvents.SqsQueueUrlConfigured.link_name,
      }),
    );
  });

  it('does not track SqsQueueUrlConfigured when spot interruption handling is simple', async () => {
    const { user } = render(
      <Formik
        initialValues={{
          ...initialValues(true),
          [FieldId.SpotInterruptionHandling]: SpotInterruptionMode.Simple,
          [FieldId.SpotTerminationHandlerQueueUrl]: '',
        }}
        onSubmit={jest.fn()}
      >
        <CreateROSAWizardInternal {...analyticsWizardProps} />
      </Formik>,
    );

    await user.click(screen.getByTestId('trigger-valid-next-step'));

    expect(trackMock).not.toHaveBeenCalledWith(
      trackEvents.SqsQueueUrlConfigured.event,
      expect.anything(),
    );
  });
});
