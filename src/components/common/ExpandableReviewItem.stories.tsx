import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ExpandableReviewItem } from '~/components/clusters/wizards/common/ReviewCluster/ExpandableReviewItem';

const meta: Meta<typeof ExpandableReviewItem> = {
  title: 'Wizards/Common/ExpandableReviewItem',
  component: ExpandableReviewItem,
  parameters: {
    docs: {
      description: {
        component:
          'Component for making review content expandable/collapsible with "Show more/Show less" toggle.',
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
            🔍 Expandable Review Item
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Purpose:</strong> Used for long content in review items (e.g., YAML configs,
              long lists)
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Toggle:</strong> "Show more" / "Show less" buttons to expand/collapse content
            </p>
            <p style={{ margin: '0' }}>
              <strong>Usage:</strong> Automatically applied by ReviewSection when
              reviewValue.isExpandable is true
            </p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    initiallyExpanded: {
      control: 'boolean',
      description: 'Whether the content is initially expanded',
    },
    children: {
      control: 'text',
      description: 'Content to be made expandable',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableReviewItem>;

export const ShortContent: Story = {
  args: {
    initiallyExpanded: true,
    children: (
      <div>
        <p>
          This is a short piece of content that doesn't really need to be expandable, but
          demonstrates the component behavior.
        </p>
      </div>
    ),
  },
};

export const LongContent: Story = {
  args: {
    initiallyExpanded: false,
    children: (
      <div>
        <p>
          <strong>ROSA Cluster Configuration</strong>
        </p>
        <p>
          This is a much longer piece of content that would benefit from being collapsible to save
          space in the review screen.
        </p>
        <p>
          It might contain detailed configuration information, lists of settings, or other verbose
          content that users might want to expand only when needed.
        </p>
        <ul>
          <li>Cluster Name: my-rosa-cluster</li>
          <li>Version: 4.14.8</li>
          <li>Region: us-east-1</li>
          <li>Availability Zones: us-east-1a, us-east-1b, us-east-1c</li>
          <li>Machine Type: m5.xlarge</li>
          <li>Node Count: 3</li>
          <li>Network Configuration: Custom VPC</li>
          <li>Security Groups: sg-12345678, sg-87654321</li>
        </ul>
      </div>
    ),
  },
};

export const YAMLConfiguration: Story = {
  args: {
    initiallyExpanded: false,
    children: (
      <pre style={{ fontSize: '12px', lineHeight: '1.4' }}>
        {`apiVersion: v1
kind: Cluster
metadata:
  name: my-rosa-cluster
  namespace: rosa-clusters
spec:
  version: "4.14.8"
  region: us-east-1
  multiAZ: true
  nodes:
    machineType: m5.xlarge
    count: 3
    autoscaling:
      enabled: false
  networking:
    machineCIDR: 10.0.0.0/16
    serviceCIDR: 172.30.0.0/16
    podCIDR: 10.128.0.0/14
    hostPrefix: 23
  aws:
    accountId: "123456789012"
    region: us-east-1
    roles:
      installer: arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role
      support: arn:aws:iam::123456789012:role/ManagedOpenShift-Support-Role
      worker: arn:aws:iam::123456789012:role/ManagedOpenShift-Worker-Role`}
      </pre>
    ),
  },
};

export const NetworkingDetails: Story = {
  args: {
    initiallyExpanded: false,
    children: (
      <div>
        <h4>VPC Configuration</h4>
        <p>
          <strong>VPC ID:</strong> vpc-12345678
        </p>
        <p>
          <strong>CIDR Block:</strong> 10.0.0.0/16
        </p>

        <h4>Subnets</h4>
        <ul>
          <li>
            <strong>Public Subnet 1:</strong> subnet-abc123 (10.0.1.0/24) - us-east-1a
          </li>
          <li>
            <strong>Public Subnet 2:</strong> subnet-def456 (10.0.2.0/24) - us-east-1b
          </li>
          <li>
            <strong>Private Subnet 1:</strong> subnet-ghi789 (10.0.10.0/24) - us-east-1a
          </li>
          <li>
            <strong>Private Subnet 2:</strong> subnet-jkl012 (10.0.20.0/24) - us-east-1b
          </li>
        </ul>

        <h4>Security Groups</h4>
        <ul>
          <li>
            <strong>Control Plane:</strong> sg-ctrl123 (ports 6443, 22623)
          </li>
          <li>
            <strong>Worker Nodes:</strong> sg-work456 (ports 80, 443, 10250)
          </li>
          <li>
            <strong>Ingress:</strong> sg-ingr789 (ports 80, 443)
          </li>
        </ul>
      </div>
    ),
  },
};

export const InitiallyExpanded: Story = {
  args: {
    initiallyExpanded: true,
    children: (
      <div>
        <p>
          <strong>Machine Pool Settings</strong>
        </p>
        <p>This content starts expanded but can be collapsed by clicking "Show less".</p>
        <ul>
          <li>Instance Type: m5.xlarge (4 vCPUs, 16 GB RAM)</li>
          <li>Root Volume: 120 GB gp3</li>
          <li>Autoscaling: Enabled (3-10 nodes)</li>
          <li>Labels: environment=production, team=platform</li>
          <li>Taints: None</li>
        </ul>
      </div>
    ),
  },
};

export const PlainTextContent: Story = {
  args: {
    initiallyExpanded: false,
    children: (
      <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
        {`Cluster Creation Summary:

✓ AWS Account: 123456789012
✓ Region: us-east-1
✓ Availability Zones: 3 (Multi-AZ)
✓ OpenShift Version: 4.14.8
✓ Machine Type: m5.xlarge
✓ Node Count: 3 (fixed)
✓ Network: Public cluster
✓ Updates: Manual
✓ Storage: Default CSI driver
✓ Monitoring: Enabled
✓ Logging: CloudWatch integration

Ready to create cluster with the above configuration.
Estimated setup time: 30-45 minutes.`}
      </div>
    ),
  },
};
