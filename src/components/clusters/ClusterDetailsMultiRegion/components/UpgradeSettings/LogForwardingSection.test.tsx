import React from 'react';

import { mockLogForwardingGroupTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { useFetchLogForwarders } from '~/queries/ClusterDetailsQueries/useFetchLogForwarders';
import { HCP_LOG_FORWARDING } from '~/queries/featureGates/featureConstants';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';
import { mockUseFeatureGate, render, screen } from '~/testUtils';
import type { AugmentedCluster } from '~/types/types';

import { isHibernating } from '../../../common/clusterStates';

import { LogForwardingSection } from './LogForwardingSection';

jest.mock('~/queries/ClusterDetailsQueries/useFetchLogForwarders');
jest.mock('~/queries/RosaWizardQueries/useFetchLogForwardingGroups');
jest.mock('~/queries/RosaWizardQueries/useFetchLogForwardingApplications');

jest.mock('../../../common/clusterStates', () => ({
  isHibernating: jest.fn(() => false),
  isHypershiftCluster: jest.fn(() => true),
  isROSA: jest.fn(() => true),
}));

jest.mock('./components/AddEditLogForwardingModal', () => ({
  AddEditLogForwardingModal: ({
    isOpen,
    destinationType,
    mode,
  }: {
    isOpen: boolean;
    destinationType: string;
    mode: string;
  }) => (isOpen ? <div data-testid={`add-edit-${destinationType}-${mode}`} /> : null),
}));

jest.mock('./components/DeleteLogForwardingModal', () => ({
  DeleteLogForwardingModal: ({
    isOpen,
    destinationType,
  }: {
    isOpen: boolean;
    destinationType: string;
  }) => (isOpen ? <div data-testid={`delete-${destinationType}`} /> : null),
}));

const mockUseFetchLogForwarders = useFetchLogForwarders as jest.Mock;
const mockUseFetchLogForwardingGroups = useFetchLogForwardingGroups as jest.Mock;
const mockUseFetchLogForwardingApplications = useFetchLogForwardingApplications as jest.Mock;
const mockIsHibernating = isHibernating as jest.Mock;

const defaultLogForwardersResponse = {
  data: [],
  isLoading: false,
  isError: false,
  error: null,
};

const defaultLogForwardingGroupsResponse = {
  data: [],
  isLoading: false,
};

const defaultLogForwardingApplicationsResponse = {
  data: [],
  isLoading: false,
};

const mockCluster: AugmentedCluster = {
  id: 'cluster-1',
  name: 'my-cluster',
  state: 'ready',
  status: { configuration_mode: 'full' },
  canEdit: true,
  canUpdateClusterResource: true,
  subscription: {
    rh_region_id: 'us-east-1',
    plan: { type: 'MOA' },
  },
} as AugmentedCluster;

const cloudWatchLogGroupName = '/aws/rosa/my-group';
const cloudWatchRoleArn = 'arn:aws:iam::123456789012:role/forward';

const cloudWatchForwarder = {
  id: 'lf-cw-1',
  cloudwatch: {
    log_group_name: cloudWatchLogGroupName,
    log_distribution_role_arn: cloudWatchRoleArn,
  },
  applications: ['api-audit'],
  status: { state: 'ready' },
};

describe('LogForwardingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureGate([[HCP_LOG_FORWARDING, true]]);
    mockUseFetchLogForwardingGroups.mockReturnValue(defaultLogForwardingGroupsResponse);
    mockUseFetchLogForwardingApplications.mockReturnValue(defaultLogForwardingApplicationsResponse);
    mockUseFetchLogForwarders.mockReturnValue(defaultLogForwardersResponse);
    mockIsHibernating.mockReturnValue(false);
  });

  it('shows empty state when no forwarders are configured', () => {
    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('Control plane log forwarding')).toBeInTheDocument();
    expect(screen.getByText('No log forwarding configured.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeInTheDocument();
  });

  it('shows Other applications under selected groups and applications', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: mockLogForwardingGroupTree,
      isLoading: false,
    });
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: [{ name: 'kube-dns', enabled: true }],
      isLoading: false,
    });

    mockUseFetchLogForwarders.mockReturnValue({
      data: [
        {
          id: 'lf-s3-1',
          s3: { bucket_name: 'test-bucket-1' },
          applications: ['kube-dns'],
          status: { state: 'ready' },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('other')).toBeInTheDocument();
    expect(screen.getByText('kube-dns')).toBeInTheDocument();
  });

  it('shows Amazon S3 forwarder details', () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [
        {
          id: 'lf-s3-1',
          s3: { bucket_name: 'test-bucket-1', bucket_prefix: 'test' },
          applications: ['api-audit'],
          status: { state: 'ready' },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.getByText('test-bucket-1')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Amazon S3 configuration actions' }),
    ).toBeInTheDocument();
  });

  it('opens add modal from Add configuration dropdown', async () => {
    const { user } = render(<LogForwardingSection cluster={mockCluster} />);

    await user.click(screen.getByRole('button', { name: 'Add configuration' }));
    await user.click(screen.getByRole('menuitem', { name: 'Amazon S3' }));

    expect(screen.getByTestId('add-edit-s3-add')).toBeInTheDocument();
  });

  it('opens delete modal from card kebab menu', async () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [
        {
          id: 'lf-s3-1',
          s3: { bucket_name: 'test-bucket-1' },
          applications: ['api-audit'],
          status: { state: 'ready' },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { user } = render(<LogForwardingSection cluster={mockCluster} />);

    await user.click(screen.getByRole('button', { name: 'Amazon S3 configuration actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete configuration' }));

    expect(screen.getByTestId('delete-s3')).toBeInTheDocument();
  });

  it('does not render when feature gate is disabled', () => {
    mockUseFeatureGate([[HCP_LOG_FORWARDING, false]]);

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.queryByText('Control plane log forwarding')).not.toBeInTheDocument();
  });

  it('shows loading spinner while forwarders are loading', () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByLabelText('Loading log forwarding configuration')).toBeInTheDocument();
  });

  it('shows error alert when forwarders fail to load', () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: { errorMessage: 'Request failed' },
    });

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('Could not load control plane log forwarding')).toBeInTheDocument();
    expect(screen.getByText('Request failed')).toBeInTheDocument();
  });

  it('shows a message when forwarders have no supported destinations', () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [{ id: 'lf-unknown-1', applications: ['orphan-app'] }],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(
      screen.getByText('No supported log forwarding destinations are configured.'),
    ).toBeInTheDocument();
  });

  it('shows CloudWatch forwarder details', () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [cloudWatchForwarder],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('CloudWatch')).toBeInTheDocument();
    expect(screen.getByText(cloudWatchLogGroupName)).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          !!element &&
          element.classList.contains('pf-v6-c-truncate') &&
          element.textContent === cloudWatchRoleArn,
      ),
    ).toBeInTheDocument();
  });

  it('opens edit modal from card kebab menu', async () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [
        {
          id: 'lf-s3-1',
          s3: { bucket_name: 'test-bucket-1' },
          applications: ['api-audit'],
          status: { state: 'ready' },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { user } = render(<LogForwardingSection cluster={mockCluster} />);

    await user.click(screen.getByRole('button', { name: 'Amazon S3 configuration actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit configuration' }));

    expect(screen.getByTestId('add-edit-s3-edit')).toBeInTheDocument();
  });

  it('opens edit modal for CloudWatch from card kebab menu', async () => {
    mockUseFetchLogForwarders.mockReturnValue({
      data: [cloudWatchForwarder],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { user } = render(<LogForwardingSection cluster={mockCluster} />);

    await user.click(screen.getByRole('button', { name: 'CloudWatch configuration actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit configuration' }));

    expect(screen.getByTestId('add-edit-cloudwatch-edit')).toBeInTheDocument();
  });

  it('disables add configuration when cluster is hibernating', () => {
    mockIsHibernating.mockReturnValue(true);

    render(<LogForwardingSection cluster={mockCluster} />);

    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeDisabled();
  });
});
