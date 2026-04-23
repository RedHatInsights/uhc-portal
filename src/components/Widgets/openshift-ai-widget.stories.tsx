import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import OpenShiftAiWidget from './openshift-ai-widget';

const meta: Meta<typeof OpenShiftAiWidget> = {
  title: 'Widgets/OpenShiftAiWidget',
  component: OpenShiftAiWidget,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', margin: '1em' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OpenShiftAiWidget>;

export const Default: Story = {
  name: 'Default',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the widget body text is rendered
    const bodyText = await canvas.findByText(
      /Create, train, and serve artificial intelligence and machine learning \(AI\/ML\) models\./,
    );
    await expect(bodyText).toBeInTheDocument();

    // Verify the link text is rendered
    const link = await canvas.findByRole('link', { name: /OpenShift AI/i });
    await expect(link).toBeInTheDocument();

    // Verify the link points to the correct external URL
    await expect(link).toHaveAttribute(
      'href',
      'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai/trial',
    );

    // Verify external link attributes (target="_blank" and rel="noopener noreferrer")
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};
