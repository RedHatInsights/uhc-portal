import { Meta, StoryObj } from '@storybook/react';

import {
  ENHANCED_SPOT_VERSION_DISABLED_REASON,
  SpotInterruptionMode,
} from './spotInterruptionHandlingConstants';
import { SpotInterruptionHandlingFields } from './SpotInterruptionHandlingFields';

const meta: Meta<typeof SpotInterruptionHandlingFields> = {
  title: 'Clusters/Shared/SpotInterruptionHandlingFields',
  component: SpotInterruptionHandlingFields,
  args: {
    mode: SpotInterruptionMode.Simple,
    sqsQueueUrl: '',
    onModeChange: () => undefined,
    onSqsQueueUrlChange: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof SpotInterruptionHandlingFields>;

export const SimpleSelected: Story = {
  name: 'Simple Spot instances',
};

export const EnhancedSelected: Story = {
  name: 'Enhanced Spot instances',
  args: {
    mode: SpotInterruptionMode.Enhanced,
  },
};

export const EnhancedWithUrl: Story = {
  name: 'Enhanced with SQS queue URL',
  args: {
    mode: SpotInterruptionMode.Enhanced,
    sqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
  },
};

export const EnhancedWithValidationError: Story = {
  name: 'Enhanced with validation error',
  args: {
    mode: SpotInterruptionMode.Enhanced,
    sqsQueueUrl: 'not-a-url',
    sqsQueueUrlValidated: 'error',
    sqsQueueUrlHelperText: 'Enter a valid SQS queue URL.',
  },
};

export const EnhancedDisabled: Story = {
  name: 'Enhanced disabled',
  args: {
    mode: SpotInterruptionMode.Enhanced,
    sqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
    isEnhancedDisabled: true,
    enhancedDisabledReason: ENHANCED_SPOT_VERSION_DISABLED_REASON,
  },
};

export const EnhancedDisabledByVersion: Story = {
  name: 'Enhanced disabled below 4.22',
  args: {
    isEnhancedDisabled: true,
    enhancedDisabledReason: ENHANCED_SPOT_VERSION_DISABLED_REASON,
  },
};
