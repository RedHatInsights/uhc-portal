import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { mockLogForwardingGroupTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import {
  LOG_FORWARDING_OTHER_GROUP_NAME,
  LOG_FORWARDING_OTHER_GROUP_ROOT_ID,
} from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';

import {
  buildSingleLogForwarder,
  getRosaLogForwardersForClusterRequest,
  logForwarderToFormValues,
  normalizeLogForwarderGroupSubmitId,
  splitLogForwardingSelectionForSubmit,
} from './buildClusterLogForwarders';

describe('normalizeLogForwarderGroupSubmitId', () => {
  it('lowercases the API group name and preserves spaces', () => {
    expect(normalizeLogForwarderGroupSubmitId('API')).toBe('api');
    expect(normalizeLogForwarderGroupSubmitId('Controller manager')).toBe('controller manager');
  });
});

describe('splitLogForwardingSelectionForSubmit', () => {
  it('puts full multi-app group selection into group ids', () => {
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(
      mockLogForwardingGroupTree,
      ['api-audit', 'api-server'],
    );
    expect(groupIds).toEqual(['api']);
    expect(applications).toEqual([]);
  });

  it('puts partial group selection into applications only', () => {
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(
      mockLogForwardingGroupTree,
      ['api-audit'],
    );
    expect(groupIds).toEqual([]);
    expect(applications).toEqual(['api-audit']);
  });

  it('treats the only leaf in a one-leaf group as full group selection', () => {
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(
      mockLogForwardingGroupTree,
      ['controller-manager-child'],
    );
    expect(groupIds).toEqual(['controller manager']);
    expect(applications).toEqual([]);
  });

  it('falls back to all ids as applications when tree is missing', () => {
    expect(splitLogForwardingSelectionForSubmit(undefined, ['a', 'b'])).toEqual({
      groupIds: [],
      applications: ['a', 'b'],
    });
  });

  it('always submits Other group items as individual applications, even when fully selected', () => {
    const treeWithOther = [
      ...mockLogForwardingGroupTree,
      {
        id: LOG_FORWARDING_OTHER_GROUP_ROOT_ID,
        text: LOG_FORWARDING_OTHER_GROUP_NAME,
        children: [
          { id: 'etcd', text: 'etcd' },
          { id: 'private-router', text: 'private-router' },
        ],
      },
    ];

    // All Other apps selected — must still go into applications, not groupIds
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(treeWithOther, [
      'etcd',
      'private-router',
    ]);
    expect(groupIds).toEqual([]);
    expect(applications).toEqual(['etcd', 'private-router']);
  });

  it('submits a partial Other selection as individual applications', () => {
    const treeWithOther = [
      {
        id: LOG_FORWARDING_OTHER_GROUP_ROOT_ID,
        text: LOG_FORWARDING_OTHER_GROUP_NAME,
        children: [
          { id: 'etcd', text: 'etcd' },
          { id: 'private-router', text: 'private-router' },
        ],
      },
    ];

    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(treeWithOther, [
      'etcd',
    ]);
    expect(groupIds).toEqual([]);
    expect(applications).toEqual(['etcd']);
  });
});

describe('getRosaLogForwardersForClusterRequest', () => {
  it('builds separate forwarders for CloudWatch and S3 when both enabled', () => {
    const form = {
      [FieldId.LogForwardingCloudWatchEnabled]: true,
      [FieldId.LogForwardingCloudWatchRoleArn]: 'arn:aws:iam::123456789012:role/forward',
      [FieldId.LogForwardingCloudWatchLogGroupName]: '/aws/group',
      [FieldId.LogForwardingCloudWatchSelectedItems]: ['api-audit', 'api-server'],
      [FieldId.LogForwardingS3Enabled]: true,
      [FieldId.LogForwardingS3BucketName]: 'my-bucket',
      [FieldId.LogForwardingS3BucketPrefix]: 'prefix/',
      [FieldId.LogForwardingS3SelectedItems]: ['auth-kube-apiserver', 'auth-konnectivity-agent'],
    };

    const forwarders = getRosaLogForwardersForClusterRequest(form, mockLogForwardingGroupTree);
    expect(forwarders).toHaveLength(2);
    expect(forwarders[0].cloudwatch).toEqual({
      log_distribution_role_arn: 'arn:aws:iam::123456789012:role/forward',
      log_group_name: '/aws/group',
    });
    expect(forwarders[0].groups).toEqual([{ id: 'api' }]);
    expect(forwarders[0].applications).toEqual([]);

    expect(forwarders[1].s3).toEqual({
      bucket_name: 'my-bucket',
      bucket_prefix: 'prefix/',
    });
    expect(forwarders[1].groups).toEqual([{ id: 'authentication' }]);
    expect(forwarders[1].applications).toEqual([]);
  });

  it('returns empty when destinations enabled but nothing selected', () => {
    const form = {
      [FieldId.LogForwardingS3Enabled]: true,
      [FieldId.LogForwardingS3BucketName]: 'b',
      [FieldId.LogForwardingS3SelectedItems]: [],
    };
    expect(getRosaLogForwardersForClusterRequest(form, mockLogForwardingGroupTree)).toEqual([]);
  });
});

describe('buildSingleLogForwarder', () => {
  it('builds an S3 forwarder from modal form values', () => {
    const forwarder = buildSingleLogForwarder(
      's3',
      {
        bucketName: 'my-bucket',
        bucketPrefix: 'logs/',
        logGroupName: '',
        roleArn: '',
        selectedItems: ['api-audit', 'api-server'],
      },
      mockLogForwardingGroupTree,
    );
    expect(forwarder).toEqual({
      s3: { bucket_name: 'my-bucket', bucket_prefix: 'logs/' },
      groups: [{ id: 'api' }],
      applications: [],
    });
  });

  it('builds a CloudWatch forwarder from modal form values', () => {
    const forwarder = buildSingleLogForwarder(
      'cloudwatch',
      {
        bucketName: '',
        bucketPrefix: '',
        logGroupName: '/aws/rosa/group',
        roleArn: 'arn:aws:iam::123456789012:role/forward',
        selectedItems: ['auth-kube-apiserver'],
      },
      mockLogForwardingGroupTree,
    );
    expect(forwarder?.cloudwatch).toEqual({
      log_group_name: '/aws/rosa/group',
      log_distribution_role_arn: 'arn:aws:iam::123456789012:role/forward',
    });
    expect(forwarder?.applications).toEqual(['auth-kube-apiserver']);
  });
});

describe('logForwarderToFormValues', () => {
  it('maps an existing S3 forwarder to form values', () => {
    const forwarder = {
      s3: { bucket_name: 'bucket-a', bucket_prefix: 'pfx/' },
      groups: [{ id: 'api' }],
      applications: [],
    };
    expect(logForwarderToFormValues('s3', forwarder, mockLogForwardingGroupTree)).toEqual({
      bucketName: 'bucket-a',
      bucketPrefix: 'pfx/',
      logGroupName: '',
      roleArn: '',
      selectedItems: ['api-audit', 'api-server'],
    });
  });
});
