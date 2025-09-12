import React from 'react';

import { DescriptionList } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import ReviewRoleItem from './ReviewRoleItem';

const meta: Meta<typeof ReviewRoleItem> = {
  title: 'Wizards/ROSA/Common/ReviewRoleItem',
  component: ReviewRoleItem,
  parameters: {
    docs: {
      description: {
        component:
          'Component for displaying AWS role ARNs in the review screen with loading and error states.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', margin: '20px' }}>
        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '2px solid #f0ad4e',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              color: '#8a6d3b',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            ⚠️ AWS Role Validation Component
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              This component validates AWS IAM roles during cluster review and shows:
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>• Loading:</strong> Spinner while fetching role details
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>• Success:</strong> Role ARN when validation passes
            </p>
            <p style={{ margin: '0' }}>
              <strong>• Error:</strong> Popover hint when role is missing/invalid
            </p>
          </div>
        </div>
        <DescriptionList>
          <Story />
        </DescriptionList>
      </div>
    ),
  ],
  argTypes: {
    name: {
      control: 'text',
      description: 'Display name for the role (e.g., "ocm-role", "user-role")',
    },
    content: {
      control: 'text',
      description: 'Role ARN content to display when validation succeeds',
    },
    getRoleResponse: {
      control: 'object',
      description: 'Response object with pending, error, and fulfilled states',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReviewRoleItem>;

export const LoadingState: Story = {
  name: 'Loading State',
  args: {
    name: 'ocm-role',
    getRoleResponse: {
      pending: true,
      error: false,
      fulfilled: false,
    },
    content: null,
  },
};

export const SuccessState: Story = {
  name: 'Success State',
  args: {
    name: 'user-role',
    getRoleResponse: {
      pending: false,
      error: false,
      fulfilled: true,
    },
    content: 'arn:aws:iam::123456789012:role/RH-Managed-OpenShift-User-my-org-Role',
  },
};

export const ErrorStateWithResponse: Story = {
  name: 'Error State (With Response)',
  args: {
    name: 'ocm-role',
    getRoleResponse: {
      pending: false,
      error: true,
      fulfilled: false,
    },
    content: null,
  },
};

export const ErrorStateNoContent: Story = {
  name: 'Error State (No Content)',
  args: {
    name: 'user-role',
    getRoleResponse: {
      pending: false,
      error: false,
      fulfilled: true,
    },
    content: null, // Fulfilled but no content = role not found
  },
};

export const OCMRoleSuccess: Story = {
  name: 'OCM Role Success',
  args: {
    name: 'ocm-role',
    getRoleResponse: {
      pending: false,
      error: false,
      fulfilled: true,
    },
    content: 'arn:aws:iam::123456789012:role/RH-Managed-OpenShift-OCM-my-org-Role',
  },
};

export const UserRoleWithLongARN: Story = {
  name: 'User Role with Long ARN',
  args: {
    name: 'user-role',
    getRoleResponse: {
      pending: false,
      error: false,
      fulfilled: true,
    },
    content:
      'arn:aws:iam::123456789012:role/RH-Managed-OpenShift-User-my-very-long-organization-name-Role',
  },
};
