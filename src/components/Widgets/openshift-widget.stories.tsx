import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import OpenShiftWidget from './openshift-widget';

const meta: Meta<typeof OpenShiftWidget> = {
  title: 'Widgets/OpenShiftWidget',
  component: OpenShiftWidget,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', padding: '1em' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OpenShiftWidget>;

export const Default: Story = {
  name: 'Default',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the widget body text renders
    await expect(
      await canvas.findByText(/Build, run, and scale container-based applications/),
    ).toBeInTheDocument();

    // Verify the link text renders
    const link = await canvas.findByRole('link', { name: /OpenShift/i });
    await expect(link).toBeInTheDocument();

    // Verify the link points to the correct internal route
    await expect(link).toHaveAttribute('href', '/openshift');

    // Verify the card structure is present (PatternFly plain card)
    const card = canvasElement.querySelector('.pf-v6-c-card');
    await expect(card).toBeInTheDocument();
  },
};
