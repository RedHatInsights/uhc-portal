import React from 'react';

import { render, screen, waitFor } from '~/testUtils';
import type { AugmentedCluster } from '~/types/types';

import { useEditChannelOnCluster } from '../../../../../../queries/ChannelEditQueries/useEditChannelOnCluster';
import { useGetSchedules } from '../../../../../../queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import fixtures from '../../../__tests__/ClusterDetails.fixtures';

import { ChannelEdit } from './ChannelEdit';

jest.mock('../../../../../../queries/ChannelEditQueries/useEditChannelOnCluster');
jest.mock('../../../../../../queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules');

jest.mock('~/components/common/ErrorBox', () => (props: { message?: string }) => {
  const { message } = props;
  return <div data-testid="error-box">{message}</div>;
});

jest.mock('./ChannelSelect', () => ({
  ChannelSelect: ({
    input,
    optionsDropdownData,
  }: {
    input: { value: string; onChange: (v: string) => void };
    optionsDropdownData: { value: string; label: string }[];
  }) => (
    <select
      data-testid="channel-select"
      value={input.value}
      onChange={(e) => input.onChange(e.target.value)}
    >
      {optionsDropdownData.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const mockUseEditChannelOnCluster = useEditChannelOnCluster as jest.Mock;
const mockUseGetSchedules = useGetSchedules as jest.Mock;

describe('<ChannelEdit />', () => {
  let mutateMock: jest.Mock;

  const mockedROSAHyperShiftCluster = {
    ...(fixtures.ROSAHypershiftClusterDetails.cluster as unknown as AugmentedCluster),
    canUpdateClusterResource: true,
    version: {
      ...(fixtures.ROSAHypershiftClusterDetails.cluster as { version?: object }).version,
      available_channels: ['stable-4.16', 'eus-4.16'],
    },
  };

  const mockedROSAHyperShiftWaitingCluster = {
    ...(fixtures.ROSAHypershiftWaitingClusterDetails.cluster as unknown as AugmentedCluster),
    canUpdateClusterResource: true,
    version: {
      ...(fixtures.ROSAHypershiftWaitingClusterDetails.cluster as { version?: object }).version,
      available_channels: ['stable-4.16', 'eus-4.16'],
    },
  };

  beforeEach(() => {
    mutateMock = jest.fn();
    mockUseEditChannelOnCluster.mockClear();
    mockUseGetSchedules.mockClear();
    mockUseGetSchedules.mockReturnValue({
      data: { items: [] },
      isLoading: false,
    });

    mockUseEditChannelOnCluster.mockReturnValue({
      mutate: mutateMock,
      isError: false,
      error: null,
    });
  });

  it('should show a loading spinner for the channel while cluster details are refetching', () => {
    render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
        isClusterDetailsFetching
      />,
    );

    expect(screen.getByLabelText('Loading channel')).toBeInTheDocument();
    expect(screen.queryByTestId('channelModal')).not.toBeInTheDocument();
  });

  it('should render the channel and an enabled edit button when editable and channels exist', () => {
    render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    expect(screen.getByText('Channel')).toBeInTheDocument();
    expect(screen.getByText('stable-4.16')).toBeInTheDocument();
    const openModalButton = screen.getByTestId('channelModal');
    expect(openModalButton).toBeInTheDocument();
    expect(openModalButton).toBeEnabled();
  });

  it('should render a disabled edit button when cluster is not ready', () => {
    render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftWaitingCluster}
      />,
    );

    expect(screen.getByText('Channel')).toBeInTheDocument();
    expect(screen.getByText('stable-4.16')).toBeInTheDocument();
    const openModalButton = screen.getByTestId('channelModal');
    expect(openModalButton).toBeInTheDocument();
    expect(openModalButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable channel edit and show tooltip when a recurring upgrade policy is enabled', async () => {
    mockUseGetSchedules.mockReturnValue({
      data: {
        items: [{ id: 'policy-1', schedule_type: 'automatic' }],
      },
      isLoading: false,
    });
    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    const openModalButton = screen.getByTestId('channelModal');
    expect(openModalButton).toHaveAttribute('aria-disabled', 'true');

    await user.hover(openModalButton);

    expect(
      await screen.findByText(
        'Channel editing is not available while an upgrade policy is scheduled.',
      ),
    ).toBeInTheDocument();

    await user.click(openModalButton);
    expect(screen.queryByRole('dialog', { name: /edit channel/i })).not.toBeInTheDocument();
  });

  it('should disable channel edit when a manual upgrade is scheduled', async () => {
    mockUseGetSchedules.mockReturnValue({
      data: {
        items: [{ id: 'policy-2', schedule_type: 'manual' }],
      },
      isLoading: false,
    });
    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    const openModalButton = screen.getByTestId('channelModal');
    expect(openModalButton).toHaveAttribute('aria-disabled', 'true');
    await user.click(openModalButton);
    expect(screen.queryByRole('dialog', { name: /edit channel/i })).not.toBeInTheDocument();
  });

  it('should render N/A when channel is not provided', () => {
    render(<ChannelEdit clusterID="cluster-123" cluster={mockedROSAHyperShiftCluster} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should not render an edit button when available channels list is empty', () => {
    const clusterNoChannels = {
      ...mockedROSAHyperShiftCluster,
      version: {
        ...mockedROSAHyperShiftCluster.version,
        available_channels: [] as string[],
      },
    };
    render(
      <ChannelEdit clusterID="cluster-123" channel="stable-4.16" cluster={clusterNoChannels} />,
    );

    expect(screen.getByText('stable-4.16')).toBeInTheDocument();
    expect(screen.queryByTestId('channelModal')).not.toBeInTheDocument();
  });

  it('should not render an edit button when the only available channel is the current channel', () => {
    const clusterSingleCurrentOnly = {
      ...mockedROSAHyperShiftCluster,
      version: {
        ...mockedROSAHyperShiftCluster.version,
        available_channels: ['stable-4.16'],
      },
    };
    render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={clusterSingleCurrentOnly}
      />,
    );

    expect(screen.getByText('stable-4.16')).toBeInTheDocument();
    expect(screen.queryByTestId('channelModal')).not.toBeInTheDocument();
  });

  it('should not render an edit button if user cannot update cluster resource', () => {
    const nonEditableCluster = {
      ...mockedROSAHyperShiftCluster,
      canEdit: true,
      canUpdateClusterResource: false,
    };
    render(
      <ChannelEdit clusterID="cluster-123" channel="stable-4.16" cluster={nonEditableCluster} />,
    );

    const openModalButton = screen.queryByTestId('channelModal');
    expect(openModalButton).not.toBeInTheDocument();
  });

  it('should open the modal when the edit button is clicked', async () => {
    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByTestId('channelModal'));

    expect(screen.getByRole('dialog', { name: /edit channel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should close the modal when cancel button is clicked', async () => {
    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByTestId('channelModal'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should have a disabled save button initially in the modal', async () => {
    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByTestId('channelModal'));

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('should call mutate with channel when save is clicked after changing selection', async () => {
    mockUseEditChannelOnCluster.mockReturnValue({
      mutate: mutateMock,
      isError: false,
      error: null,
      isPending: false,
    });

    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByTestId('channelModal'));
    await user.selectOptions(screen.getByTestId('channel-select'), 'eus-4.16');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        { clusterID: 'cluster-123', channel: 'eus-4.16' },
        expect.any(Object),
      );
    });
  });

  it('should display an error in the modal if mutation fails', async () => {
    mockUseEditChannelOnCluster.mockReturnValue({
      mutate: mutateMock,
      isError: true,
      error: { error: { errorMessage: 'Changing channel resulted in error' } },
    });

    const { user } = render(
      <ChannelEdit
        clusterID="cluster-123"
        channel="stable-4.16"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByTestId('channelModal'));

    expect(screen.getByTestId('error-box')).toBeInTheDocument();
    expect(screen.getByText('Changing channel resulted in error')).toBeInTheDocument();
  });
});
