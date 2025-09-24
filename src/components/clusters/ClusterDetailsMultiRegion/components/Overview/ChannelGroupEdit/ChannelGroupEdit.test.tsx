import React from 'react';

import { render, screen, waitFor } from '~/testUtils';

import { useMutateChannelGroup } from '../../../../../../queries/ChannelGroupEditQueries/useMutateChannelGroup';
import fixtures from '../../../__tests__/ClusterDetails.fixtures';

import { CanEditCluster, ChannelGroupEdit } from './ChannelGroupEdit';
import { useGetChannelGroupsData } from './useGetChannelGroupsData';

jest.mock('./useGetChannelGroupsData');
jest.mock('../../../../../../queries/ChannelGroupEditQueries/useMutateChannelGroup');

jest.mock('~/components/common/ErrorBox', () => (props: any) => {
  const { message } = props;
  return <div data-testid="error-box">{message}</div>;
});

jest.mock('./ChannelGroupSelect', () => ({
  ChannelGroupSelect: ({
    input,
    optionsDropdownData,
  }: {
    input: any;
    optionsDropdownData: any;
  }) => (
    <select
      data-testid="channel-group-select"
      value={input.value}
      onChange={(e) => input.onChange(e.target.value)}
    >
      {optionsDropdownData.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const mockUseGetChannelGroupsData = useGetChannelGroupsData as jest.Mock;
const mockUseMutateChannelGroup = useMutateChannelGroup as jest.Mock;

const mockOptions = [
  { value: 'stable', label: 'Stable' },
  { value: 'fast', label: 'Fast' },
  { value: 'candidate', label: 'Candidate' },
];

describe('<ChannelGroupEdit />', () => {
  let mutateMock: jest.Mock;

  const mockedROSAHyperShiftCluster = fixtures.ROSAHypershiftClusterDetails
    .cluster as unknown as CanEditCluster;

  beforeEach(() => {
    mutateMock = jest.fn();
    mockUseGetChannelGroupsData.mockClear();
    mockUseMutateChannelGroup.mockClear();

    mockUseMutateChannelGroup.mockReturnValue({
      mutate: mutateMock,
      isError: false,
      error: null,
    });
  });

  it('Renders channel group and loading label', async () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: undefined,
      isLoading: true,
    });
    render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open modal/i })).not.toBeInTheDocument();
  });

  it('should render the channel group and an enabled edit button when not loading and editable', () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    expect(screen.getByText('Channel group')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
    const openModalButton = screen.getByRole('button', { name: /open modal/i });
    expect(openModalButton).toBeInTheDocument();
    expect(openModalButton).toBeEnabled();
  });

  it('should render N/A when channel group is not provided', () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup=""
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should render a disabled edit button if cluster is not editable', () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    const nonEditableCluster = { ...mockedROSAHyperShiftCluster, canEdit: false };
    render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={nonEditableCluster}
      />,
    );

    const openModalButton = screen.getByRole('button', { name: /open modal/i });
    expect(openModalButton).toBeInTheDocument();
    expect(openModalButton).toBeDisabled();
  });

  it('should open the modal when the edit button is clicked', async () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    const { user } = render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open modal/i }));

    expect(screen.getByRole('dialog', { name: /edit channel group/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should close the modal when cancel button is clicked', async () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    const { user } = render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open modal/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should have a disabled save button initially in the modal', async () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    const { user } = render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open modal/i }));

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('should enable save button after changing the value and call mutate on save', async () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    const { user } = render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open modal/i }));

    const saveButton = screen.getByRole('button', { name: /save/i });
    const select = screen.getByTestId('channel-group-select');

    expect(saveButton).toBeDisabled();
    expect(select).toHaveValue('stable');

    await user.selectOptions(select, 'fast');

    expect(saveButton).toBeEnabled();
    expect(select).toHaveValue('fast');

    await user.click(saveButton);

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        clusterID: 'cluster-123',
        channelGroup: 'fast',
      });
    });
  });

  it('should display an error in the modal if mutation fails', async () => {
    mockUseGetChannelGroupsData.mockReturnValue({
      availableDropdownChannelGroups: mockOptions,
      isLoading: false,
    });

    mockUseMutateChannelGroup.mockReturnValue({
      mutate: mutateMock,
      isError: true,
      error: { error: { errorMessage: 'Changing channel group resulted in error' } },
    });

    const { user } = render(
      <ChannelGroupEdit
        clusterID="cluster-123"
        channelGroup="stable"
        cluster={mockedROSAHyperShiftCluster}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open modal/i }));

    expect(screen.getByTestId('error-box')).toBeInTheDocument();
    expect(screen.getByText('Changing channel group resulted in error')).toBeInTheDocument();
  });
});
