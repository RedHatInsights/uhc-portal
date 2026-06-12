import React from 'react';

import { useFetchClusterControlPlaneLogForwarders } from '~/queries/ClusterDetailsQueries/useFetchClusterControlPlaneLogForwarders';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useFetchLogForwardingGroupsCatalog } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroupsCatalog';
import { render, screen } from '~/testUtils';
import type { AugmentedCluster } from '~/types/types';

import ControlPlaneLogForwardingSection from './ControlPlaneLogForwardingSection';

jest.mock('~/queries/featureGates/useFetchFeatureGate');
jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterControlPlaneLogForwarders');
jest.mock('~/queries/RosaWizardQueries/useFetchLogForwardingGroupsCatalog');

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

const mockCluster: AugmentedCluster = {
  id: 'cluster-1',
  name: 'my-cluster',
  state: 'ready',
  status: { configuration_mode: 'full' },
  canEdit: true,
  subscription: {
    rh_region_id: 'us-east-1',
    plan: { type: 'MOA' },
  },
} as AugmentedCluster;

describe('ControlPlaneLogForwardingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFeatureGate as jest.Mock).mockReturnValue(true);
    (useFetchLogForwardingGroupsCatalog as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('shows empty state when no forwarders are configured', () => {
    (useFetchClusterControlPlaneLogForwarders as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ControlPlaneLogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('Control plane log forwarding')).toBeInTheDocument();
    expect(screen.getByText('No log forwarding configured.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeInTheDocument();
  });

  it('shows Amazon S3 forwarder details', () => {
    (useFetchClusterControlPlaneLogForwarders as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'lf-s3-1',
          s3: { bucket_name: 'zac-test-12', bucket_prefix: 'test' },
          applications: ['api-audit'],
          status: { state: 'ready' },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ControlPlaneLogForwardingSection cluster={mockCluster} />);

    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.getByText('zac-test-12')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Amazon S3 configuration actions' }),
    ).toBeInTheDocument();
  });

  it('opens add modal from Add configuration dropdown', async () => {
    (useFetchClusterControlPlaneLogForwarders as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { user } = render(<ControlPlaneLogForwardingSection cluster={mockCluster} />);

    await user.click(screen.getByRole('button', { name: 'Add configuration' }));
    await user.click(screen.getByRole('menuitem', { name: 'Amazon S3' }));

    expect(screen.getByTestId('add-edit-s3-add')).toBeInTheDocument();
  });

  it('opens delete modal from card kebab menu', async () => {
    (useFetchClusterControlPlaneLogForwarders as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'lf-s3-1',
          s3: { bucket_name: 'zac-test-12' },
          applications: ['api-audit'],
          status: { state: 'ready' },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { user } = render(<ControlPlaneLogForwardingSection cluster={mockCluster} />);

    await user.click(screen.getByRole('button', { name: 'Amazon S3 configuration actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete configuration' }));

    expect(screen.getByTestId('delete-s3')).toBeInTheDocument();
  });

  it('does not render when feature gate is disabled', () => {
    (useFeatureGate as jest.Mock).mockReturnValue(false);
    (useFetchClusterControlPlaneLogForwarders as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ControlPlaneLogForwardingSection cluster={mockCluster} />);

    expect(screen.queryByText('Control plane log forwarding')).not.toBeInTheDocument();
  });
});
