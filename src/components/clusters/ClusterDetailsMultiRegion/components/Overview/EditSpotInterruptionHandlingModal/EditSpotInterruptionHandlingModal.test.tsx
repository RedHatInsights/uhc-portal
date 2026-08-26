import * as React from 'react';

import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import EditSpotInterruptionHandlingModal from './EditSpotInterruptionHandlingModal';

const mockEditCluster = jest.fn();

jest.mock('~/queries/ClusterDetailsQueries/useEditCluster', () => ({
  useEditCluster: () => ({
    mutate: mockEditCluster,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

const defaultCluster = {
  id: 'test-cluster-id',
  aws: {},
} as unknown as ClusterFromSubscription;

const enhancedCluster = {
  ...defaultCluster,
  region: { id: 'us-east-1' },
  aws: {
    termination_handler_queue_url:
      'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
  },
} as unknown as ClusterFromSubscription;

const onClose = jest.fn();

describe('<EditSpotInterruptionHandlingModal />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal title and actions', () => {
    render(<EditSpotInterruptionHandlingModal cluster={defaultCluster} onClose={onClose} />);

    expect(
      screen.getByRole('heading', { name: 'Spot interruption handling settings' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('initializes in simple mode when no queue URL exists', () => {
    render(<EditSpotInterruptionHandlingModal cluster={defaultCluster} onClose={onClose} />);

    expect(screen.getByRole('radio', { name: /Simple Spot instances/i })).toBeChecked();
  });

  it('initializes in enhanced mode when queue URL exists', () => {
    render(<EditSpotInterruptionHandlingModal cluster={enhancedCluster} onClose={onClose} />);

    expect(screen.getByRole('radio', { name: /Enhanced Spot instances/i })).toBeChecked();
    expect(
      screen.getByDisplayValue(
        'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
      ),
    ).toBeInTheDocument();
  });

  it('shows an https validation error for http queue URLs', async () => {
    const { user } = render(
      <EditSpotInterruptionHandlingModal cluster={defaultCluster} onClose={onClose} />,
    );

    await user.click(screen.getByRole('radio', { name: /Enhanced Spot instances/i }));
    const queueInput = screen.getByPlaceholderText(
      'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
    );
    await user.type(
      queueInput,
      'http://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
    );
    await user.tab();

    expect(
      screen.getByText('The URL should include the scheme prefix (https://)'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('validates queue URL against the cluster region', async () => {
    const clusterWithDifferentCloudRegion = {
      ...defaultCluster,
      region: { id: 'us-west-2' },
    } as unknown as ClusterFromSubscription;
    const { user } = render(
      <EditSpotInterruptionHandlingModal
        cluster={clusterWithDifferentCloudRegion}
        region="us-east-1"
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole('radio', { name: /Enhanced Spot instances/i }));
    const queueInput = screen.getByPlaceholderText(
      'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
    );
    await user.type(
      queueInput,
      'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
    );
    await user.tab();

    expect(
      screen.getByText('The SQS queue URL must be in the cluster region (us-west-2).'),
    ).toBeInTheDocument();
  });

  it('submits enhanced mode with queue URL', async () => {
    const { user } = render(
      <EditSpotInterruptionHandlingModal cluster={defaultCluster} onClose={onClose} />,
    );

    await user.click(screen.getByRole('radio', { name: /Enhanced Spot instances/i }));
    await user.type(
      screen.getByPlaceholderText(
        'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
      ),
      'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockEditCluster).toHaveBeenCalledWith(
      {
        clusterID: 'test-cluster-id',
        cluster: {
          aws: {
            termination_handler_queue_url:
              'https://sqs.us-east-1.amazonaws.com/123456789012/rosa-cluster-spot',
          },
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('submits simple mode by clearing queue URL', async () => {
    const { user } = render(
      <EditSpotInterruptionHandlingModal cluster={enhancedCluster} onClose={onClose} />,
    );

    await user.click(screen.getByRole('radio', { name: /Simple Spot instances/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockEditCluster).toHaveBeenCalledWith(
      {
        clusterID: 'test-cluster-id',
        cluster: {
          aws: {
            termination_handler_queue_url: '',
          },
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
