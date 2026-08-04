import React from 'react';
import { Formik, type FormikValues } from 'formik';

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FieldId, initialValues } from '~/components/clusters/wizards/rosa/constants';
import {
  type LogForwardingGroupTreeNode,
  mockLogForwardingGroupTree,
} from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { queryConstants } from '~/queries/queriesConstants';
import type { LogForwarderApplication } from '~/types/clusters_mgmt.v1';

import { LogForwardingScreen } from './LogForwardingScreen';

/** Cluster name from an earlier wizard step; used by CloudWatch log group autofill. */
const STORY_DEFAULT_CLUSTER_NAME = 'myCluster';

const storyDefaultFormValues: Partial<FormikValues> = {
  [FieldId.ClusterName]: STORY_DEFAULT_CLUSTER_NAME,
};

/** Orphan application (not in mock groups tree) so the synthetic "Other" group appears in stories. */
const MOCK_LOG_FORWARDING_APPLICATIONS: LogForwarderApplication[] = [
  { name: 'scheduler', enabled: true },
];

function buildQueryClient(
  groupsTree: LogForwardingGroupTreeNode[] = mockLogForwardingGroupTree,
  applications: LogForwarderApplication[] = MOCK_LOG_FORWARDING_APPLICATIONS,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData([queryConstants.FETCH_LOG_FORWARDING_GROUPS], groupsTree);
  queryClient.setQueryData([queryConstants.FETCH_LOG_FORWARDING_APPLICATIONS], applications);
  return queryClient;
}

type StoryShellProps = {
  /** Merged into ROSA wizard `initialValues` for fields this step reads. */
  formValues?: Partial<FormikValues>;
  groupsTree?: LogForwardingGroupTreeNode[];
  applications?: LogForwarderApplication[];
};

/**
 * Renders {@link LogForwardingScreen} with Formik and seeded react-query cache so
 * {@link LogForwardingGroupsApplicationsSelector} does not call the network.
 */
function LogForwardingScreenStoryShell({
  formValues = {},
  groupsTree = mockLogForwardingGroupTree,
  applications = MOCK_LOG_FORWARDING_APPLICATIONS,
}: StoryShellProps) {
  const queryClient = React.useMemo(
    () => buildQueryClient(groupsTree, applications),
    [groupsTree, applications],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Formik<FormikValues>
        initialValues={{
          ...initialValues(),
          ...storyDefaultFormValues,
          ...formValues,
        }}
        enableReinitialize
        onSubmit={() => undefined}
      >
        <LogForwardingScreen />
      </Formik>
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Wizards/ROSA/LogForwarding/Control plane log forwarding',
  component: LogForwardingScreenStoryShell,
  parameters: {
    docs: {
      description: {
        component:
          'ROSA HCP wizard log forwarding step (`LogForwardingScreen`). React Query is seeded with mock groups and applications so the groups/applications selector does not call the API.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', maxWidth: '72rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LogForwardingScreenStoryShell>;

export default meta;

type Story = StoryObj<typeof LogForwardingScreenStoryShell>;

export const Default: Story = {
  name: 'Default (destinations disabled)',
};

export const S3Enabled: Story = {
  name: 'Amazon S3 enabled',
  args: {
    formValues: {
      [FieldId.LogForwardingS3Enabled]: true,
      [FieldId.LogForwardingS3BucketName]: 'my-rosa-logs-bucket',
      [FieldId.LogForwardingS3BucketPrefix]: 'clusters/demo/',
    },
  },
};

export const CloudWatchEnabled: Story = {
  name: 'CloudWatch enabled',
  args: {
    formValues: {
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchPrerequisiteAck]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: 'myCluster-a1b2',
      [FieldId.LogForwardingCloudWatchRoleArn]: 'arn:aws:iam::123456789012:role/LogForwarder',
    },
  },
};

export const BothEnabled: Story = {
  name: 'S3 and CloudWatch enabled',
  args: {
    formValues: {
      [FieldId.LogForwardingS3Enabled]: true,
      [FieldId.LogForwardingS3BucketName]: 'my-rosa-logs-bucket',
      [FieldId.LogForwardingS3SelectedItems]: ['api-audit', 'api-server'],
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchPrerequisiteAck]: true,
      [FieldId.LogForwardingCloudWatchLogGroupName]: 'myCluster-a1b2',
      [FieldId.LogForwardingCloudWatchRoleArn]: 'arn:aws:iam::123456789012:role/LogForwarder',
      [FieldId.LogForwardingCloudWatchSelectedItems]: ['auth-konnectivity-agent'],
    },
  },
};
