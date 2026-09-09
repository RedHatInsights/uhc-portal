import { Meta, StoryObj } from '@storybook/react';

import { SpotInterruptionMode } from './spotInterruptionHandlingConstants';
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
