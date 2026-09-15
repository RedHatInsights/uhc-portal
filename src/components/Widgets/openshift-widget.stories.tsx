import React from 'react';

import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import OpenShiftWidget from './openshift-widget';

const meta: Meta<typeof OpenShiftWidget> = {
  title: 'Widgets/OpenShiftWidget',
  component: OpenShiftWidget,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Card>
          <CardHeader>
            <CardTitle>Red Hat OpenShift *</CardTitle>
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

type Story = StoryObj<typeof OpenShiftWidget>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: /Red Hat OpenShift/ }),
    ).toBeInTheDocument();

    await expect(
      await canvas.findByText(/Build, run, and scale container-based applications/),
    ).toBeInTheDocument();

    const link = await canvas.findByRole('link', { name: /^OpenShift$/i });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', '/openshift');
    await expect(link).not.toHaveAttribute('target', '_blank');
  },
};
