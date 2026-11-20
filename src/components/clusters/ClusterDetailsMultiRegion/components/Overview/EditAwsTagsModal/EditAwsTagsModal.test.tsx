import * as React from 'react';

import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';
import { render, screen, waitFor } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import EditAwsTagsModal from './EditAwsTagsModal';

const mockEditCluster = jest.fn();
const mockUseEditCluster = jest.fn();

jest.mock('~/queries/ClusterDetailsQueries/useEditCluster', () => ({
  useEditCluster: () => mockUseEditCluster(),
}));

const cluster = {
  id: 'test-cluster-id',
  aws: {
    tags: {
      env: 'prod',
      team: 'payments',
      'red-hat-managed': 'true',
      'red-hat-clustertype': 'rosa',
    },
  },
} as unknown as ClusterFromSubscription;

const onClose = jest.fn();

describe('<EditAwsTagsModal />', () => {
  beforeEach(() => {
    mockUseEditCluster.mockReturnValue({
      mutate: mockEditCluster,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows editable user tags and read-only system tags', () => {
    render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Edit cluster AWS tags' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cluster AWS tags are applied to the AWS resources created for this cluster/,
      ),
    ).toBeInTheDocument();
    const keyInputs = screen.getAllByLabelText('Key');
    expect(keyInputs).toHaveLength(2);
    expect(keyInputs[0]).toHaveValue('env');
    expect(keyInputs[1]).toHaveValue('team');
    expect(screen.getByText('red-hat-managed=true')).toBeInTheDocument();
    expect(screen.getByText('red-hat-clustertype=rosa')).toBeInTheDocument();
  });

  it('disables Save until a tag is changed', () => {
    render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('sends only the changed tags, with null for removed tags', async () => {
    const { user } = render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    const valueInputs = screen.getAllByLabelText('Value');
    await user.clear(valueInputs[0]);
    await user.type(valueInputs[0], 'staging');
    await user.click(screen.getAllByRole('button', { name: 'Remove AWS tag' })[1]);
    await user.click(screen.getByRole('button', { name: 'Add AWS tag' }));
    await user.type(screen.getAllByLabelText('Key')[1], 'owner');
    await user.type(screen.getAllByLabelText('Value')[1], 'alice');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => expect(mockEditCluster).toHaveBeenCalledTimes(1));
    expect(mockEditCluster.mock.calls[0][0]).toEqual({
      clusterID: 'test-cluster-id',
      cluster: { aws: { tags: { env: 'staging', team: null, owner: 'alice' } } },
    });
  });

  it('refreshes cluster details and node pools after saving', async () => {
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
    mockEditCluster.mockImplementationOnce((_input, { onSuccess }) => onSuccess());
    const { user } = render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    await user.type(screen.getAllByLabelText('Value')[0], '-2');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
        'clusterService',
        'test-cluster-id',
      ],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [
        queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
        'nodePoolWithUpgradePolicies',
        'clusterService',
        'test-cluster-id',
      ],
    });
  });

  it('rejects a reserved tag key', async () => {
    const { user } = render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Add AWS tag' }));
    await user.type(screen.getAllByLabelText('Key')[2], 'Name');
    await user.type(screen.getAllByLabelText('Value')[2], 'my-cluster');

    expect(
      await screen.findByText('This AWS tag key is reserved and cannot be used.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('disables Save when a tag is invalid', async () => {
    const { user } = render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    await user.clear(screen.getAllByLabelText('Value')[0]);

    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows an error when the update fails', () => {
    mockUseEditCluster.mockReturnValue({
      mutate: mockEditCluster,
      isPending: false,
      isError: true,
      error: { errorMessage: 'Invalid Cluster AWS tags' },
    });

    render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    expect(screen.getByText('Error updating AWS tags')).toBeInTheDocument();
  });

  it('shows an empty tag row when the cluster has no AWS tags', () => {
    render(
      <EditAwsTagsModal
        cluster={{ id: 'test-cluster-id' } as ClusterFromSubscription}
        onClose={onClose}
      />,
    );

    expect(screen.getByLabelText('Key')).toHaveValue('');
    expect(screen.queryByText('Managed by Red Hat')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('does not send a request when the cluster has no ID', async () => {
    const { user } = render(
      <EditAwsTagsModal
        cluster={{ ...cluster, id: undefined } as ClusterFromSubscription}
        onClose={onClose}
      />,
    );

    await user.type(screen.getAllByLabelText('Value')[0], '-2');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    expect(mockEditCluster).not.toHaveBeenCalled();
  });

  it('prevents closing the modal while saving', () => {
    mockUseEditCluster.mockReturnValue({
      mutate: mockEditCluster,
      isPending: true,
      isError: false,
      error: null,
    });

    render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const { user } = render(<EditAwsTagsModal cluster={cluster} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });
});
