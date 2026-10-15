import React from 'react';

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fn } from 'storybook/test';

import { CreateFirewallRulesModal } from './CreateFirewallRulesModal';

const CREATE_COMMAND =
  'ocm gcp create firewall-rules --name=<name> --wif-config=dc-wif-5 --project-id=my-host-project --vpc-name=ocmdev-shared-vpc --machine-cidr=<machine_cidr> --output-file=<output_file>';

const meta = {
  title: 'Wizards/OSD/Networking/Create Firewall Rules Modal',
  component: CreateFirewallRulesModal,
  args: {
    isOpen: true,
    onClose: fn(),
    onSuccess: fn(),
    network: 'ocmdev-shared-vpc',
    projectId: 'my-host-project',
    wifConfigId: 'dc-wif-5',
    profile: 'public',
    createFirewallRulesCommand: CREATE_COMMAND,
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', minHeight: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateFirewallRulesModal>;

export default meta;

type Story = StoryObj<typeof CreateFirewallRulesModal>;

export const Default: Story = {
  name: 'Create firewall rules (CLI reference)',
};

export const PrivateProfile: Story = {
  name: 'Private profile CLI reference',
  args: {
    profile: 'private',
    createFirewallRulesCommand: `${CREATE_COMMAND} --profile=private`,
  },
};
