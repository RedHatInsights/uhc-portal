import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { LoadingSkeletonCard } from './LoadingSkeletonCard';

const meta: Meta<typeof LoadingSkeletonCard> = {
  title: 'Common/LoadingSkeletonCard',
  component: LoadingSkeletonCard,
  render: (props) => <LoadingSkeletonCard {...props} />,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 1em', minHeight: '15em' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LoadingSkeletonCard>;

export const Smaller: Story = {
  name: 'Default Skeleton',
  args: {
    titleFontSize: 'lg',
    bodyFontSize: 'lg',
    footerFontSize: 'lg',
  },
};
