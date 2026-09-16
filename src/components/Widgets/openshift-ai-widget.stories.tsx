import React from 'react';

import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import OpenShiftAiWidget from './openshift-ai-widget';

const meta: Meta<typeof OpenShiftAiWidget> = {
  title: 'Widgets/OpenShiftAiWidget',
  component: OpenShiftAiWidget,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Card>
          <CardHeader>
            <CardTitle>Red Hat OpenShift AI *</CardTitle>
          </CardHeader>
          <CardBody>
            <Story />
          </CardBody>
        </Card>
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#6a6e73' }}>
          * Title is only defined in Storybook. The HCC home-page dashboard supplies the card
          chrome, title, icon, kebab menu, and drag handle. Our widget only provides the body
          content and link.
        </p>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OpenShiftAiWidget>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: /Red Hat OpenShift AI/ }),
    ).toBeInTheDocument();

    await expect(
      await canvas.findByText(
        /Create, train, and serve artificial intelligence and machine learning \(AI\/ML\) models\./,
      ),
    ).toBeInTheDocument();

    const link = await canvas.findByRole('link', { name: /OpenShift AI/i });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute(
      'href',
      'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai/trial',
    );
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};
