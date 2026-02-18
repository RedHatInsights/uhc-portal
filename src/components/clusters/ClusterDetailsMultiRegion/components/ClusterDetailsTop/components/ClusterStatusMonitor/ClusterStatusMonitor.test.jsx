import React from 'react';

import { useFetchClusterStatus } from '~/queries/ClusterDetailsQueries/ClusterStatusMonitor/useFetchClusterStatus';
import {
  useFetchInflightChecks,
  useFetchRerunInflightChecks,
  useMutateRerunInflightChecks,
} from '~/queries/ClusterDetailsQueries/useFetchInflightChecks';
import { checkAccessibility, render, screen, within } from '~/testUtils';
import { InflightCheckState } from '~/types/clusters_mgmt.v1/enums';

import fixtures from '../../../../__tests__/ClusterDetails.fixtures';

import ClusterStatusMonitor from './ClusterStatusMonitor';

jest.mock('~/queries/ClusterDetailsQueries/ClusterStatusMonitor/useFetchClusterStatus', () => ({
  useFetchClusterStatus: jest.fn(),
  useInvalidateFetchClusterStatus: jest.fn(),
}));
jest.mock('~/queries/ClusterDetailsQueries/useFetchInflightChecks', () => ({
  useFetchInflightChecks: jest.fn(),
  useFetchRerunInflightChecks: jest.fn(),
  useMutateRerunInflightChecks: jest.fn(),
  useInvalidateFetchInflightChecks: jest.fn(),
}));

const { clusterDetails, OSDGCPClusterDetails } = fixtures;

// TODO: These tests throw warnings due to list items not having unique keys

describe('<ClusterStatusMonitor />', () => {
  const useFetchClusterStatusMock = useFetchClusterStatus;
  const useFetchInflightChecksMock = useFetchInflightChecks;
  const useFetchRerunInflightChecksMock = useFetchRerunInflightChecks;
  const useMutateRerunInflightChecksMock = useMutateRerunInflightChecks;

  const refresh = jest.fn();

  const defaultProps = {
    cluster: { ...clusterDetails.cluster, state: 'installing' },
    refresh,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls getClusterStatus on mount without region', () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    render(<ClusterStatusMonitor {...defaultProps} />);
    expect(useFetchClusterStatusMock).toHaveBeenCalledWith(
      clusterDetails.cluster.id,
      undefined,
      false,
    );
    expect(useFetchInflightChecksMock).toHaveBeenCalledWith(
      clusterDetails.cluster.id,
      clusterDetails.cluster.subscription,
      undefined,
      false,
      true,
    );
  });

  it('calls getClusterStatus on mount with region', () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    render(<ClusterStatusMonitor {...defaultProps} region="aws.ap-southeast-1.stage" />);
    expect(useFetchClusterStatusMock).toHaveBeenCalledWith(
      clusterDetails.cluster.id,
      'aws.ap-southeast-1.stage',
      false,
    );
    expect(useFetchInflightChecksMock).toHaveBeenCalledWith(
      clusterDetails.cluster.id,
      clusterDetails.cluster.subscription,
      'aws.ap-southeast-1.stage',
      false,
      true,
    );
  });

  it('sets the timeout when cluster is installing', () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        state: 'waiting',
      },
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    // set pending: true first since the logic depends on the pending -> fulfilled transition
    const { rerender } = render(<ClusterStatusMonitor {...defaultProps} />);

    rerender(<ClusterStatusMonitor {...defaultProps} />);

    expect(useFetchClusterStatusMock).toHaveBeenLastCalledWith(
      clusterDetails.cluster.id,
      undefined,
      false,
    );
    expect(useFetchClusterStatusMock).toHaveBeenCalledTimes(2); // one call on mount, second on timer
    expect(refresh).not.toHaveBeenCalled();
  });

  it('renders null when no error', () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        state: 'installing',
      },
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    const { container } = render(<ClusterStatusMonitor {...defaultProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('Displays warning when install takes longer', async () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        state: 'installing',
        id: clusterDetails.cluster.id,
        provision_error_code: '',
        provision_error_message: 'Install taking longer than expected',
      },
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    const newProps = {
      ...defaultProps,
    };

    render(<ClusterStatusMonitor {...newProps} />);

    expect(
      within(screen.getByTestId('alert-long-install')).getByText(
        /Installation is taking longer than expected/,
      ),
    ).toBeInTheDocument();
  });

  it('calls refresh when the status changes', () => {
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchClusterStatusMock.mockReturnValueOnce({
      isLoading: false,
      data: {
        id: clusterDetails.cluster.id,
        status: 'installing',
      },
      isError: false,
      error: null,
    });
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        id: clusterDetails.cluster.id,
        state: 'error',
        provision_error_code: 'OCM1002',
        provision_error_message: 'Invalid AWS credentials (authentication)',
      },
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValueOnce({
      isLoading: false,
      checks: null,
    });

    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: {
        items: [{ state: 'running' }],
      },
    });
    const { rerender } = render(<ClusterStatusMonitor {...defaultProps} />);
    expect(refresh).not.toHaveBeenCalled();

    rerender(<ClusterStatusMonitor {...defaultProps} />);

    expect(refresh).toHaveBeenCalled();
  });

  it('renders an alert when cluster is errored', () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        id: clusterDetails.cluster.id,
        state: 'error',
        provision_error_code: 'OCM1002',
        provision_error_message: 'Invalid AWS credentials (authentication)',
      },
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    render(
      <ClusterStatusMonitor
        {...defaultProps}
        status={{
          fulfilled: true,
          pending: false,
          status: {
            id: clusterDetails.cluster.id,
            state: 'error',
            provision_error_code: 'OCM1002',
            provision_error_message: 'Invalid AWS credentials (authentication)',
          },
        }}
      />,
    );
    expect(screen.getByText('Danger alert:')).toBeInTheDocument();
  });

  it('renders URLs embedded in alerts as links', () => {
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        id: clusterDetails.cluster.id,
        state: 'error',
        description: 'wut wut.',
        provision_error_code: 'OCM3055',
        provision_error_message:
          "Your cluster's installation role does not have permissions to use the default KMS key in your AWS account. Ensure that the installation role has permissions to use this key and try again. If you're using a custom KMS key, ensure the key exists. Learn more: https://access.redhat.com/solutions/7048553",
      },
      isError: false,
      error: null,
    });
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
    });
    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });
    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    render(
      <ClusterStatusMonitor
        {...defaultProps}
        status={{
          fulfilled: true,
          pending: false,
          status: {
            id: clusterDetails.cluster.id,
            state: 'error',
            description: 'wut wut.',
            provision_error_code: 'OCM3055',
            provision_error_message:
              "Your cluster's installation role does not have permissions to use the default KMS key in your AWS account. Ensure that the installation role has permissions to use this key and try again. If you're using a custom KMS key, ensure the key exists. Learn more: https://access.redhat.com/solutions/7048553",
          },
        }}
      />,
    );
    expect(screen.getByText('Danger alert:')).toBeInTheDocument();
    expect(
      screen.getByText(/Your cluster's installation role does not have permissions/),
    ).toBeInTheDocument();
    expect(screen.getByText(/wut wut./)).toBeInTheDocument();
    expect(screen.getByText('https://access.redhat.com/solutions/7048553')).toHaveRole('link');
    expect(screen.getByText('https://access.redhat.com/solutions/7048553')).toHaveAttribute('href');
  });

  it('displays the subnets from the inflightError in a table', async () => {
    // Mock inflight checks with failed check containing subnet egress errors
    const mockInflightError = {
      state: InflightCheckState.failed,
      details: {
        'subnet-12345': {
          'egress_url_errors-0':
            'egressURL error: https://registry.redhat.io:443 (Proxy CONNECT aborted)',
          'egress_url_errors-1':
            'egressURL error: https://api.openshift.com:443 (Connection timeout)',
        },
        'subnet-67890': {
          'egress_url_errors-3':
            'egressURL error: https://console.redhat.com:443 (DNS resolution failed)',
          'egress_url_errors-4':
            'egressURL error: https://access.redhat.com:443 (Connection refused)',
        },
        documentation_link: 'https://docs.openshift.com/rosa/egress-requirements',
      },
    };

    // Create cluster with inflight_checks to satisfy hasInflightEgressErrors function
    const clusterWithInflightChecks = {
      ...defaultProps.cluster,
      state: 'installing',
      inflight_checks: [mockInflightError],
    };

    // Mock the cluster status - must match cluster ID for component to render
    useFetchClusterStatusMock.mockReturnValue({
      isLoading: false,
      data: {
        id: clusterWithInflightChecks.id,
        state: 'installing',
      },
      isError: false,
      error: null,
    });

    // Mock inflight checks query to return the failed check
    useFetchInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: {
        data: {
          items: [mockInflightError],
        },
      },
    });

    useMutateRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    useFetchRerunInflightChecksMock.mockReturnValue({
      isLoading: false,
      data: null,
      isError: false,
      error: null,
    });

    const { user, container } = render(
      <ClusterStatusMonitor {...defaultProps} cluster={clusterWithInflightChecks} />,
    );

    // Wait for the component to process the data
    await screen.findByText('User action required');

    // Verify the warning alert is displayed
    expect(screen.getByText('User action required')).toBeInTheDocument();
    expect(
      screen.getByText(
        'To allow this cluster to be fully-managed, add these URLs to the allowlist of these subnet firewalls. For more information review the egress requirements or contact Red Hat support.',
      ),
    ).toBeInTheDocument();

    // Verify the table is displayed with correct headers
    expect(screen.getByText('Subnet')).toBeInTheDocument();
    expect(screen.getByText('URLs')).toBeInTheDocument();

    // Verify first subnet is displayed
    expect(screen.getByText('subnet-12345')).toBeInTheDocument();

    // Verify URLs are displayed in the table
    expect(screen.getByText(/https:\/\/registry\.redhat\.io:443/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/api\.openshift\.com:443/)).toBeInTheDocument();

    // Verify documentation link is displayed
    expect(screen.getByText('Review egress requirements')).toHaveAttribute(
      'href',
      'https://docs.openshift.com/rosa/egress-requirements',
    );

    // Expand and verify second subnet is shown
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getByText('subnet-67890')).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/console\.redhat\.com:443/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/access\.redhat\.com:443/)).toBeInTheDocument();

    await checkAccessibility(container);
  });

  describe('GCP clusters shared VPC permissions alert', () => {
    const prepareProps = (stateDescription) => ({
      ...defaultProps,
      cluster: {
        ...OSDGCPClusterDetails.cluster,
        gcp_network: {
          vpc_project_id: 'ocm-ui-dev',
        },
        state: 'waiting',
        status: {
          state: 'waiting',
          description: stateDescription,
          dns_ready: false,
          oidc_ready: false,
          provision_error_message: '',
          provision_error_code: '',
          configuration_mode: 'full',
          limited_support_reason_count: 0,
        },
      },
    });
    const alertTitle = 'Permissions needed:';

    beforeEach(() => {
      useFetchInflightChecksMock.mockReturnValue({
        isLoading: false,
        data: null,
      });
      useMutateRerunInflightChecksMock.mockReturnValue({
        isLoading: false,
        data: null,
        isError: false,
        error: null,
      });
      useFetchRerunInflightChecksMock.mockReturnValue({
        isLoading: false,
        data: null,
        isError: false,
        error: null,
      });
      useFetchClusterStatusMock.mockReturnValue({
        isLoading: false,
        data: {
          id: OSDGCPClusterDetails.cluster.id,
          state: 'waiting',
        },
        isError: false,
        error: null,
      });
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('includes the affected service account', async () => {
      const description =
        'User action required: Could not validate the shared subnets in the host project ocm-ui-dev. Make sure the following service account(s) [my-account-1@example-proj-4.iam.gserviceaccount.com] defined in the service project ocm-ui-dev, has been granted the Compute Network Admin, Compute Security Admin, and DNS Administrator roles via the host project IAM.';
      const props = prepareProps(description);
      render(<ClusterStatusMonitor {...props} />);

      expect(await screen.findByText(alertTitle)).toBeInTheDocument();
      expect(screen.queryByText('unknown')).not.toBeInTheDocument();
      expect(
        screen.getByText('my-account-1@example-proj-4.iam.gserviceaccount.com'),
      ).toBeInTheDocument();
    });

    it('includes multiple affected service accounts', () => {
      const description =
        'User action required: Could not validate the shared subnets in the host project ocm-ui-dev. Make sure the following service account(s) [my-role-1@example-proj-4.gserviceaccount.com my-role-2@example-proj-4.gserviceaccount.com my-role-3@example-proj-4.gserviceaccount.com] defined in the service project ocm-ui-dev, has been granted the Compute Network Admin, Compute Security Admin, and DNS Administrator roles via the host project IAM.';
      const props = prepareProps(description);
      render(<ClusterStatusMonitor {...props} />);

      expect(screen.getByText(alertTitle)).toBeInTheDocument();
      expect(screen.queryByText('unknown')).not.toBeInTheDocument();
      expect(screen.getByText('my-role-1@example-proj-4.gserviceaccount.com')).toBeInTheDocument();
      expect(screen.getByText('my-role-2@example-proj-4.gserviceaccount.com')).toBeInTheDocument();
      expect(screen.getByText('my-role-3@example-proj-4.gserviceaccount.com')).toBeInTheDocument();
    });

    it('includes "unknown" if no service accounts are found', () => {
      const description =
        'User action required: Could not validate the shared subnets in the host project ocm-ui-dev.';
      const props = prepareProps(description);
      render(<ClusterStatusMonitor {...props} />);

      expect(screen.getByText(alertTitle)).toBeInTheDocument();
      expect(screen.getByText('unknown')).toBeInTheDocument();
    });
  });
});
