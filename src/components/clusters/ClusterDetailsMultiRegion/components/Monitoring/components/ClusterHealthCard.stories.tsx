import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { monitoringStatuses } from '../monitoringHelper';

import { ClusterHealthCard } from './ClusterHealthCard';

import '../Monitoring.scss';

const meta: Meta<typeof ClusterHealthCard> = {
  title: 'Clusters/Monitoring/ClusterHealthCard',
  component: ClusterHealthCard,
  render: (props) => <ClusterHealthCard {...props} />,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '50em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: Object.values(monitoringStatuses),
    },
    lastCheckIn: {
      control: 'date',
    },
    discoveredIssues: {
      control: 'number',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ClusterHealthCard>;

export const Healthy: Story = {
  args: {
    status: monitoringStatuses.HEALTHY,
    lastCheckIn: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
};

export const HasIssues: Story = {
  args: {
    status: monitoringStatuses.HAS_ISSUES,
    discoveredIssues: 3,
    lastCheckIn: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
  },
};

export const HasSingleIssue: Story = {
  args: {
    status: monitoringStatuses.HAS_ISSUES,
    discoveredIssues: 1,
    lastCheckIn: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
};

export const Disconnected: Story = {
  args: {
    status: monitoringStatuses.DISCONNECTED,
    lastCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
};

export const Upgrading: Story = {
  args: {
    status: monitoringStatuses.UPGRADING,
    lastCheckIn: new Date(Date.now() - 30 * 1000), // 30 seconds ago
  },
};

export const NoMetrics: Story = {
  args: {
    status: monitoringStatuses.NO_METRICS,
    lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
};

export const Unknown: Story = {
  args: {
    status: monitoringStatuses.UNKNOWN,
    lastCheckIn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
};

export const WithoutLastCheckIn: Story = {
  args: {
    status: monitoringStatuses.HEALTHY,
  },
};
