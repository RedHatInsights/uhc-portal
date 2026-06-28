import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { validateLogForwardingFields } from '~/components/clusters/wizards/rosa/LogForwarding/logForwardingValidation';

import { rosaWizardFormValidator } from './formValidators';
import { stepId } from './rosaWizardConstants';

jest.mock('~/components/clusters/wizards/rosa/LogForwarding/logForwardingValidation');

const mockValidateLogForwardingFields = validateLogForwardingFields as jest.MockedFunction<
  typeof validateLogForwardingFields
>;

const logForwardingOff = {
  [FieldId.LogForwardingS3Enabled]: false,
  [FieldId.LogForwardingCloudWatchEnabled]: false,
};

const rosaHcpLogForwardingContext = {
  [FieldId.Hypershift]: 'true',
  [FieldId.Product]: 'ROSA',
  [FieldId.CloudProvider]: 'aws',
};

const validAutoscaling = {
  resource_limits: {
    cores: { min: 0, max: 128 },
    memory: { min: 0, max: 512 },
  },
};

const logForwardingStep = stepId.CLUSTER_ADDITIONAL_SETTINGS__LOG_FORWARDING;

describe('rosaWizardFormValidator', () => {
  beforeEach(() => {
    mockValidateLogForwardingFields.mockReset();
    mockValidateLogForwardingFields.mockReturnValue({});
  });

  it('returns an empty object when cluster autoscaling is disabled and log forwarding is off', () => {
    expect(
      rosaWizardFormValidator(
        {
          [FieldId.ClusterAutoscaling]: null,
          ...logForwardingOff,
        },
        logForwardingStep,
      ),
    ).toEqual({});

    expect(mockValidateLogForwardingFields).not.toHaveBeenCalled();
  });

  it('returns only log forwarding errors when autoscaling is disabled and forwarding is enabled with errors', () => {
    const lfErrors = { [FieldId.LogForwardingS3BucketName]: 'Bucket name is required.' };
    mockValidateLogForwardingFields.mockReturnValue(lfErrors);

    const result = rosaWizardFormValidator(
      {
        [FieldId.ClusterAutoscaling]: null,
        [FieldId.LogForwardingS3Enabled]: true,
        [FieldId.LogForwardingCloudWatchEnabled]: false,
        ...rosaHcpLogForwardingContext,
      },
      logForwardingStep,
    );

    expect(result).toEqual(lfErrors);
    expect(mockValidateLogForwardingFields).toHaveBeenCalledTimes(1);
  });

  it('skips log forwarding validation on other steps even when CloudWatch is enabled', () => {
    mockValidateLogForwardingFields.mockReturnValue({
      [FieldId.LogForwardingCloudWatchRoleArn]: 'Role ARN is required.',
    });

    expect(
      rosaWizardFormValidator(
        {
          [FieldId.ClusterAutoscaling]: null,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingS3Enabled]: false,
        },
        stepId.CLUSTER_ADDITIONAL_SETTINGS__UPDATES,
      ),
    ).toEqual({});

    expect(mockValidateLogForwardingFields).not.toHaveBeenCalled();
  });

  it('returns an empty object when autoscaling is disabled, forwarding is on, and validation passes', () => {
    mockValidateLogForwardingFields.mockReturnValue({});

    expect(
      rosaWizardFormValidator(
        {
          [FieldId.ClusterAutoscaling]: undefined,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingS3Enabled]: false,
          ...rosaHcpLogForwardingContext,
        },
        logForwardingStep,
      ),
    ).toEqual({});
  });

  it('returns an empty object when autoscaling limits are valid and log forwarding is off', () => {
    expect(
      rosaWizardFormValidator(
        {
          [FieldId.ClusterAutoscaling]: validAutoscaling,
          ...logForwardingOff,
        },
        logForwardingStep,
      ),
    ).toEqual({});

    expect(mockValidateLogForwardingFields).not.toHaveBeenCalled();
  });

  it('returns only log forwarding errors when autoscaling limits are valid', () => {
    const lfErrors = { [FieldId.LogForwardingCloudWatchRoleArn]: 'Role ARN is required.' };
    mockValidateLogForwardingFields.mockReturnValue(lfErrors);

    const result = rosaWizardFormValidator(
      {
        [FieldId.ClusterAutoscaling]: validAutoscaling,
        [FieldId.LogForwardingS3Enabled]: true,
        [FieldId.LogForwardingCloudWatchEnabled]: false,
        ...rosaHcpLogForwardingContext,
      },
      logForwardingStep,
    );

    expect(result).toEqual(lfErrors);
  });

  it('returns cluster autoscaling resource limit errors when cores min exceeds max', () => {
    const result = rosaWizardFormValidator(
      {
        [FieldId.ClusterAutoscaling]: {
          resource_limits: {
            cores: { min: 10, max: 5 },
            memory: { min: 0, max: 100 },
          },
        },
        ...logForwardingOff,
      },
      logForwardingStep,
    );

    expect(result).toEqual({
      cluster_autoscaling: {
        resource_limits: {
          cores: {
            min: 'The minimum cannot be above the maximum value.',
            max: 'The minimum cannot be above the maximum value.',
          },
        },
      },
    });
  });

  it('returns cluster autoscaling resource limit errors when memory min exceeds max', () => {
    const result = rosaWizardFormValidator(
      {
        [FieldId.ClusterAutoscaling]: {
          resource_limits: {
            cores: { min: 0, max: 64 },
            memory: { min: 200, max: 100 },
          },
        },
        ...logForwardingOff,
      },
      logForwardingStep,
    );

    expect(result).toEqual({
      cluster_autoscaling: {
        resource_limits: {
          memory: {
            min: 'The minimum cannot be above the maximum value.',
            max: 'The minimum cannot be above the maximum value.',
          },
        },
      },
    });
  });

  it('merges autoscaling and log forwarding errors when both apply', () => {
    mockValidateLogForwardingFields.mockReturnValue({
      [FieldId.LogForwardingS3BucketName]: 'Bucket name is required.',
    });

    const result = rosaWizardFormValidator(
      {
        [FieldId.ClusterAutoscaling]: {
          resource_limits: {
            cores: { min: 2, max: 1 },
            memory: { min: 0, max: 50 },
          },
        },
        [FieldId.LogForwardingS3Enabled]: true,
        [FieldId.LogForwardingCloudWatchEnabled]: false,
        ...rosaHcpLogForwardingContext,
      },
      logForwardingStep,
    );

    expect(result).toEqual({
      cluster_autoscaling: {
        resource_limits: {
          cores: {
            min: 'The minimum cannot be above the maximum value.',
            max: 'The minimum cannot be above the maximum value.',
          },
        },
      },
      [FieldId.LogForwardingS3BucketName]: 'Bucket name is required.',
    });
  });

  it('calls validateLogForwardingFields when either S3 or CloudWatch forwarding is enabled on the log forwarding step', () => {
    mockValidateLogForwardingFields.mockReturnValue({});

    rosaWizardFormValidator(
      {
        [FieldId.ClusterAutoscaling]: null,
        [FieldId.LogForwardingS3Enabled]: false,
        [FieldId.LogForwardingCloudWatchEnabled]: true,
        ...rosaHcpLogForwardingContext,
      },
      logForwardingStep,
    );

    expect(mockValidateLogForwardingFields).toHaveBeenCalledWith(
      expect.objectContaining({
        [FieldId.LogForwardingCloudWatchEnabled]: true,
      }),
    );
  });

  it('validates log forwarding on the review step for ROSA HCP clusters', () => {
    mockValidateLogForwardingFields.mockReturnValue({
      [FieldId.LogForwardingCloudWatchRoleArn]: 'Role ARN is required.',
    });

    expect(
      rosaWizardFormValidator(
        {
          [FieldId.ClusterAutoscaling]: null,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingS3Enabled]: true,
          ...rosaHcpLogForwardingContext,
        },
        stepId.REVIEW_AND_CREATE,
      ),
    ).toEqual({
      [FieldId.LogForwardingCloudWatchRoleArn]: 'Role ARN is required.',
    });
  });

  it('skips log forwarding validation on the review step after switching to classic control plane', () => {
    mockValidateLogForwardingFields.mockReturnValue({
      [FieldId.LogForwardingCloudWatchRoleArn]: 'Role ARN is required.',
    });

    expect(
      rosaWizardFormValidator(
        {
          [FieldId.ClusterAutoscaling]: null,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.Hypershift]: 'false',
          [FieldId.Product]: 'ROSA',
          [FieldId.CloudProvider]: 'aws',
        },
        stepId.REVIEW_AND_CREATE,
      ),
    ).toEqual({});

    expect(mockValidateLogForwardingFields).not.toHaveBeenCalled();
  });
});
