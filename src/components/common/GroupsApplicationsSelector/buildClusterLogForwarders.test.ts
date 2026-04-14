import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import {
  getRosaLogForwardersForClusterRequest,
  normalizeLogForwarderGroupSubmitId,
  splitLogForwardingSelectionForSubmit,
} from './buildClusterLogForwarders';
import { mockLogForwardingGroupTree } from './logForwardingGroupTreeData';

describe('normalizeLogForwarderGroupSubmitId', () => {
  it('lowercases and replaces spaces with underscores', () => {
    expect(normalizeLogForwarderGroupSubmitId('API')).toBe('api');
    expect(normalizeLogForwarderGroupSubmitId('Controller manager')).toBe('controller_manager');
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

  it('puts single-root leaf into applications', () => {
    const { groupIds, applications } = splitLogForwardingSelectionForSubmit(
      mockLogForwardingGroupTree,
      ['controller-manager'],
    );
    expect(groupIds).toEqual([]);
    expect(applications).toEqual(['controller-manager']);
  });

  it('falls back to all ids as applications when tree is missing', () => {
    expect(splitLogForwardingSelectionForSubmit(undefined, ['a', 'b'])).toEqual({
      groupIds: [],
      applications: ['a', 'b'],
    });
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
