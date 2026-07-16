import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { BILLING_CONTRACT_NOTIFICATION } from '~/queries/featureGates/featureConstants';
import type { CloudAccount } from '~/types/accounts_mgmt.v1';

import AWSAccountSelection from './AWSAccountSelection';

const FEATURE_GATE_QUERY_KEY = 'featureGate' as const;

const MIXED_CONTRACT_ACCOUNTS: CloudAccount[] = [
  {
    cloud_account_id: '456456456456',
    cloud_provider_id: 'aws',
    contracts: [],
  },
  {
    cloud_account_id: '123123123123',
    cloud_provider_id: 'aws',
    contracts: [
      {
        dimensions: [{ name: 'four_vcpu_hour', value: '1' }],
        end_date: '2030-01-01',
        start_date: '2024-01-01',
      },
    ],
  },
  {
    cloud_account_id: '789789789789',
    cloud_provider_id: 'aws',
    contracts: [],
  },
  {
    cloud_account_id: '111222333444',
    cloud_provider_id: 'aws',
    contracts: [
      {
        dimensions: [{ name: 'control_plane', value: '2' }],
        end_date: '2030-01-01',
        start_date: '2024-01-01',
      },
    ],
  },
];

function buildQueryClient(isBillingContractNotificationEnabled: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData([FEATURE_GATE_QUERY_KEY, BILLING_CONTRACT_NOTIFICATION], {
    data: { enabled: isBillingContractNotificationEnabled },
  });
  return queryClient;
}

type StoryShellProps = {
  accounts?: CloudAccount[];
  isBillingAccount?: boolean;
  isBillingContractNotificationEnabled?: boolean;
  label?: string;
  selectedAWSAccountID?: string;
  extendedHelpText?: string;
};

/**
 * Renders {@link AWSAccountSelection} with seeded react-query feature-gate data so
 * Storybook does not call the feature-review API.
 */
function AWSAccountSelectionStoryShell({
  accounts = MIXED_CONTRACT_ACCOUNTS,
  isBillingAccount = true,
  isBillingContractNotificationEnabled = false,
  label = 'AWS billing account',
  selectedAWSAccountID = '',
  extendedHelpText = 'Connect ROSA to a new billing account. To add a different AWS account, log in to the account, and click get started.',
}: StoryShellProps) {
  const [selectedAccountId, setSelectedAccountId] = React.useState(selectedAWSAccountID);
  const queryClient = React.useMemo(
    () => buildQueryClient(isBillingContractNotificationEnabled),
    [isBillingContractNotificationEnabled],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AWSAccountSelection
        label={label}
        isBillingAccount={isBillingAccount}
        accounts={accounts}
        selectedAWSAccountID={selectedAccountId}
        extendedHelpText={extendedHelpText}
        isLoading={false}
        isDisabled={false}
        refresh={{
          text: 'Refresh to view any new AWS billing accounts. It can take up to 5 minutes to sync new accounts.',
          onRefresh: () => undefined,
        }}
        input={{
          name: 'billing_account_id',
          value: selectedAccountId,
          onChange: setSelectedAccountId,
          onBlur: () => undefined,
        }}
        meta={{
          touched: false,
          error: '',
        }}
        clearGetAWSAccountIDsResponse={() => undefined}
      />
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Wizards/ROSA/AccountsRoles/AWS account selection',
  component: AWSAccountSelectionStoryShell,
  parameters: {
    docs: {
      description: {
        component:
          'AWS account selection dropdown used on the ROSA Accounts & Roles step (infrastructure and billing). When `ocmui-billing-contract-notification` is enabled for billing accounts, contracted accounts sort first with a divider and “No contract enabled” labels.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', maxWidth: '40rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AWSAccountSelectionStoryShell>;

export default meta;

type Story = StoryObj<typeof AWSAccountSelectionStoryShell>;

export const BillingContractEnhancementsEnabled: Story = {
  name: 'Billing accounts (feature flag on)',
  args: {
    isBillingAccount: true,
    isBillingContractNotificationEnabled: true,
    accounts: MIXED_CONTRACT_ACCOUNTS,
  },
};

export const BillingContractEnhancementsDisabled: Story = {
  name: 'Billing accounts (feature flag off)',
  args: {
    isBillingAccount: true,
    isBillingContractNotificationEnabled: false,
    accounts: MIXED_CONTRACT_ACCOUNTS,
  },
};

export const InfrastructureAccount: Story = {
  name: 'Infrastructure account',
  args: {
    isBillingAccount: false,
    isBillingContractNotificationEnabled: false,
    label: 'Associated AWS infrastructure account',
    extendedHelpText: 'Associate an AWS account to your Red Hat account.',
    accounts: MIXED_CONTRACT_ACCOUNTS.map((account) => ({
      ...account,
      contracts: [],
    })),
  },
};
