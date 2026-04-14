import React from 'react';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';
import { render, screen, within } from '~/testUtils';

import { mockLogForwardingGroupTree } from './logForwardingGroupTreeData';
import { LogForwardingReviewDetails } from './LogForwardingReviewDetails';

jest.mock('~/queries/RosaWizardQueries/useFetchLogForwardingGroups');

const mockUseFetchLogForwardingGroups = useFetchLogForwardingGroups as jest.Mock;

const baseForm = {
  [FieldId.LogForwardingS3Enabled]: false,
  [FieldId.LogForwardingS3BucketName]: '',
  [FieldId.LogForwardingS3BucketPrefix]: '',
  [FieldId.LogForwardingS3SelectedItems]: [] as string[],
  [FieldId.LogForwardingCloudWatchEnabled]: false,
  [FieldId.LogForwardingCloudWatchLogGroupName]: '',
  [FieldId.LogForwardingCloudWatchRoleArn]: '',
  [FieldId.LogForwardingCloudWatchSelectedItems]: [] as string[],
};

describe('LogForwardingReviewDetails', () => {
  beforeEach(() => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: mockLogForwardingGroupTree,
      isLoading: false,
    });
  });

  it('renders Amazon S3 and CloudWatch sections with configuration disabled by default', () => {
    render(<LogForwardingReviewDetails formValues={baseForm} />);

    expect(screen.getByRole('heading', { name: 'Amazon S3' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CloudWatch' })).toBeInTheDocument();

    const configRows = screen.getAllByText('Configuration');
    expect(configRows).toHaveLength(2);
    const disabledLabels = screen.getAllByText('Disabled');
    expect(disabledLabels).toHaveLength(2);

    expect(screen.queryByText('Bucket name')).not.toBeInTheDocument();
    expect(screen.queryByText('Log group name')).not.toBeInTheDocument();
  });

  it('shows S3 bucket, prefix, and grouped applications when S3 is enabled', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: 'my-bucket',
          [FieldId.LogForwardingS3BucketPrefix]: 'prefix/',
          [FieldId.LogForwardingS3SelectedItems]: ['api-audit', 'api-server'],
        }}
      />,
    );

    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('my-bucket')).toBeInTheDocument();
    expect(screen.getByText('prefix/')).toBeInTheDocument();

    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('audit')).toBeInTheDocument();
    expect(screen.getByText('apiserver')).toBeInTheDocument();
  });

  it('shows None for empty S3 bucket name and plain None for empty prefix', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: '   ',
          [FieldId.LogForwardingS3BucketPrefix]: '',
          [FieldId.LogForwardingS3SelectedItems]: [],
        }}
      />,
    );

    const bucketRow = screen.getByText('Bucket name').closest('div');
    expect(bucketRow).toBeTruthy();
    expect(within(bucketRow as HTMLElement).getByText('None')).toBeInTheDocument();

    const prefixRow = screen.getByText('Bucket prefix').closest('div');
    expect(prefixRow).toBeTruthy();
    expect(within(prefixRow as HTMLElement).getByText('None')).toBeInTheDocument();

    const selectedRow = screen.getByText('Selected groups and applications').closest('div');
    expect(selectedRow).toBeTruthy();
    expect(within(selectedRow as HTMLElement).getByText('None')).toBeInTheDocument();
  });

  it('shows a spinner for selected S3 applications while the group tree is loading', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: 'b',
          [FieldId.LogForwardingS3SelectedItems]: ['api-audit'],
        }}
      />,
    );

    expect(screen.getByLabelText('Loading selected applications')).toBeInTheDocument();
  });

  it('falls back to comma-separated ids when selections are not found in the tree', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: 'b',
          [FieldId.LogForwardingS3SelectedItems]: ['unknown-one', 'unknown-two'],
        }}
      />,
    );

    expect(screen.getByText('unknown-one, unknown-two')).toBeInTheDocument();
  });

  it('shows CloudWatch log group, role ARN, and applications when CloudWatch is enabled', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/aws/openshift',
          [FieldId.LogForwardingCloudWatchRoleArn]: 'arn:aws:iam::123456789012:role/cw',
          [FieldId.LogForwardingCloudWatchSelectedItems]: ['auth-kube-apiserver'],
        }}
      />,
    );

    expect(screen.getByText('/aws/openshift')).toBeInTheDocument();
    expect(screen.getByText('arn:aws:iam::123456789012:role/cw')).toBeInTheDocument();

    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('kube-apiserver')).toBeInTheDocument();
  });

  it('shows a spinner for CloudWatch selections while loading', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: mockLogForwardingGroupTree,
      isLoading: true,
    });

    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/g',
          [FieldId.LogForwardingCloudWatchRoleArn]: 'arn:aws:iam::123456789012:role/r',
          [FieldId.LogForwardingCloudWatchSelectedItems]: ['sample-app'],
        }}
      />,
    );

    expect(screen.getByLabelText('Loading selected applications')).toBeInTheDocument();
  });

  it('renders multiple S3 label groups when selections span different roots', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: 'b',
          [FieldId.LogForwardingS3SelectedItems]: ['api-audit', 'auth-konnectivity-agent'],
        }}
      />,
    );

    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('audit')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('konnectivity-agent')).toBeInTheDocument();
  });

  it('shows None for CloudWatch log group and role when values are only whitespace', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '   ',
          [FieldId.LogForwardingCloudWatchRoleArn]: '\t',
          [FieldId.LogForwardingCloudWatchSelectedItems]: [],
        }}
      />,
    );

    const logGroupRow = screen.getByText('Log group name').closest('div');
    const roleRow = screen.getByText('Role ARN').closest('div');
    expect(within(logGroupRow as HTMLElement).getByText('None')).toBeInTheDocument();
    expect(within(roleRow as HTMLElement).getByText('None')).toBeInTheDocument();
  });

  it('renders S3 and CloudWatch details together when both are enabled', () => {
    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: 's3-bucket',
          [FieldId.LogForwardingS3SelectedItems]: ['api-audit'],
          [FieldId.LogForwardingCloudWatchEnabled]: true,
          [FieldId.LogForwardingCloudWatchLogGroupName]: '/cw',
          [FieldId.LogForwardingCloudWatchRoleArn]: 'arn:aws:iam::123456789012:role/x',
          [FieldId.LogForwardingCloudWatchSelectedItems]: ['sample-app'],
        }}
      />,
    );

    expect(screen.getByText('s3-bucket')).toBeInTheDocument();
    expect(screen.getByText('audit')).toBeInTheDocument();
    expect(screen.getByText('/cw')).toBeInTheDocument();
    expect(screen.getByText('sample-application')).toBeInTheDocument();
    expect(screen.getAllByText('Enabled')).toHaveLength(2);
  });

  it('lists selected ids when the group tree is empty and loading is finished', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <LogForwardingReviewDetails
        formValues={{
          ...baseForm,
          [FieldId.LogForwardingS3Enabled]: true,
          [FieldId.LogForwardingS3BucketName]: 'b',
          [FieldId.LogForwardingS3SelectedItems]: ['orphan-id'],
        }}
      />,
    );

    expect(screen.getByText('orphan-id')).toBeInTheDocument();
  });
});
