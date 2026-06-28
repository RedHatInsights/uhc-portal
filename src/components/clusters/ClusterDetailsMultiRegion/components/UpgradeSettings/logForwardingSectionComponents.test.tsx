import React from 'react';

import { mockLogForwardingGroupTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { render, screen } from '~/testUtils';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { AddConfigurationDropdown, LogDestinationCard } from './logForwardingSectionComponents';

const baseForwarder: LogForwarder = {
  id: 'lf-s3-1',
  s3: { bucket_name: 'my-bucket', bucket_prefix: 'logs/' },
  applications: ['api-audit'],
};

const defaultCardProps = {
  title: 'Amazon S3',
  forwarder: baseForwarder,
  tree: mockLogForwardingGroupTree,
  treeLoading: false,
  columns: [{ term: 'Bucket name', description: 'my-bucket' }],
  canManage: true,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('LogDestinationCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Ready status for a ready forwarder', () => {
    render(
      <LogDestinationCard
        {...defaultCardProps}
        forwarder={{ ...baseForwarder, status: { state: 'ready' } }}
      />,
    );

    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('audit')).toBeInTheDocument();
  });

  it('formats pending status labels from snake_case states', () => {
    render(
      <LogDestinationCard
        {...defaultCardProps}
        forwarder={{ ...baseForwarder, status: { state: 'in_progress' } }}
      />,
    );

    expect(screen.getByText('in progress')).toBeInTheDocument();
  });

  it('shows Unknown when status state is empty', () => {
    render(
      <LogDestinationCard
        {...defaultCardProps}
        forwarder={{ ...baseForwarder, status: { state: '' } }}
      />,
    );

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('shows a spinner while the groups catalog is loading', () => {
    render(<LogDestinationCard {...defaultCardProps} treeLoading />);

    expect(screen.getByLabelText('Loading groups catalog')).toBeInTheDocument();
  });

  it('falls back to comma-separated application ids when tree has no matches', () => {
    render(
      <LogDestinationCard
        {...defaultCardProps}
        forwarder={{ ...baseForwarder, applications: ['orphan-app', 'other-app'] }}
        tree={[]}
      />,
    );

    expect(screen.getByText('orphan-app, other-app')).toBeInTheDocument();
  });

  it('shows None when the forwarder has no selected applications', () => {
    render(
      <LogDestinationCard
        {...defaultCardProps}
        forwarder={{ ...baseForwarder, applications: [] }}
      />,
    );

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('truncates long configuration values without breaking layout', () => {
    const longLogGroupName = `/aws/rosa/my-cluster/${'a'.repeat(250)}`;
    const { container } = render(
      <LogDestinationCard
        {...defaultCardProps}
        columns={[{ term: 'Log group name', description: longLogGroupName }]}
      />,
    );

    expect(container.querySelector('.pf-v6-c-truncate')).toBeInTheDocument();
  });

  it('opens edit and delete actions from the kebab menu', async () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { user } = render(
      <LogDestinationCard {...defaultCardProps} onEdit={onEdit} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole('button', { name: 'Amazon S3 configuration actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit configuration' }));
    expect(onEdit).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Amazon S3 configuration actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete configuration' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('disables kebab actions when management is not allowed', () => {
    render(<LogDestinationCard {...defaultCardProps} canManage={false} />);

    expect(screen.getByRole('button', { name: 'Amazon S3 configuration actions' })).toBeDisabled();
  });

  it('wraps disabled kebab in a tooltip when a disable reason is provided', async () => {
    const { user } = render(
      <LogDestinationCard
        {...defaultCardProps}
        canManage={false}
        disableReason="This operation is not available while cluster is hibernating"
      />,
    );

    const kebabButton = screen.getByRole('button', { name: 'Amazon S3 configuration actions' });
    expect(kebabButton).toBeDisabled();

    await user.hover(kebabButton);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This operation is not available while cluster is hibernating',
    );
  });
});

describe('AddConfigurationDropdown', () => {
  it('lists Amazon S3 when only S3 can be added', async () => {
    const onSelect = jest.fn();
    const { user } = render(
      <AddConfigurationDropdown canAddS3 canAddCloudWatch={false} canManage onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('button', { name: 'Add configuration' }));
    await user.click(screen.getByRole('menuitem', { name: 'Amazon S3' }));

    expect(onSelect).toHaveBeenCalledWith('s3');
  });

  it('lists available destination types and calls onSelect', async () => {
    const onSelect = jest.fn();
    const { user } = render(
      <AddConfigurationDropdown canAddS3 canAddCloudWatch canManage onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('button', { name: 'Add configuration' }));
    await user.click(screen.getByRole('menuitem', { name: 'CloudWatch' }));

    expect(onSelect).toHaveBeenCalledWith('cloudwatch');
  });

  it('disables the dropdown when both destinations are already configured', () => {
    render(
      <AddConfigurationDropdown
        canAddS3={false}
        canAddCloudWatch={false}
        canManage
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeDisabled();
  });

  it('disables the dropdown when management is not allowed', async () => {
    const { user } = render(
      <AddConfigurationDropdown
        canAddS3
        canAddCloudWatch
        canManage={false}
        disableReason="This operation is not available while cluster is hibernating"
        onSelect={jest.fn()}
      />,
    );

    const addButton = screen.getByRole('button', { name: 'Add configuration' });
    expect(addButton).toBeDisabled();

    await user.hover(addButton);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This operation is not available while cluster is hibernating',
    );
  });

  it('shows a tooltip when all destinations are configured and a disable reason is provided', async () => {
    const { user } = render(
      <AddConfigurationDropdown
        canAddS3={false}
        canAddCloudWatch={false}
        canManage={false}
        disableReason="All supported log forwarding destinations are already configured."
        onSelect={jest.fn()}
      />,
    );

    const addButton = screen.getByRole('button', { name: 'Add configuration' });
    expect(addButton).toBeDisabled();

    await user.hover(addButton);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'All supported log forwarding destinations are already configured.',
    );
  });
});
