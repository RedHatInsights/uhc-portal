import React from 'react';

import { ACM_HUB_PROPERTY_KEY, ACM_HUB_PROPERTY_VALUE } from '~/common/acmHubConstants';
import * as useTagAcmHubModule from '~/queries/AcmHubQueries/useTagAcmHub';
import { screen, withState } from '~/testUtils';

import TagAcmHubDialog from './TagAcmHubDialog';

jest.mock('~/queries/AcmHubQueries/useTagAcmHub');

const mockedUseTagAcmHub = useTagAcmHubModule.useTagAcmHub as jest.MockedFunction<
  typeof useTagAcmHubModule.useTagAcmHub
>;

describe('<TagAcmHubDialog />', () => {
  const mutate = jest.fn();
  const resetResponse = jest.fn();
  const onClose = jest.fn();

  const baseHookReturn = {
    isSuccess: false,
    error: null,
    isError: false,
    isPending: false,
    mutate,
    mutateAsync: jest.fn(),
    reset: resetResponse,
  };

  beforeEach(() => {
    mockedUseTagAcmHub.mockReturnValue(baseHookReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls mutate with tag true when cluster is not tagged', async () => {
    const { user } = withState({
      modal: {
        data: {
          clusterID: 'c1',
          clusterName: 'Cluster One',
          region: 'us-east-1',
          properties: {},
        },
      },
    }).render(<TagAcmHubDialog onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Tag' }));

    expect(mutate).toHaveBeenCalledWith({
      clusterID: 'c1',
      region: 'us-east-1',
      tag: true,
    });
  });

  it('calls mutate with tag false when cluster is already tagged', async () => {
    const { user } = withState({
      modal: {
        data: {
          clusterID: 'c2',
          clusterName: 'Hub',
          region: 'eu-west-1',
          properties: { [ACM_HUB_PROPERTY_KEY]: ACM_HUB_PROPERTY_VALUE },
        },
      },
    }).render(<TagAcmHubDialog onClose={onClose} />);

    expect(screen.getByRole('button', { name: 'Remove tag' })).toBeInTheDocument();
    expect(screen.getByText(/Remove hub cluster tag/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove tag' }));

    expect(mutate).toHaveBeenCalledWith({
      clusterID: 'c2',
      region: 'eu-west-1',
      tag: false,
    });
  });

  it('shows error box when mutation fails', () => {
    mockedUseTagAcmHub.mockReturnValue({
      ...baseHookReturn,
      isError: true,
      error: { message: 'Tagging failed' },
    });

    withState({
      modal: {
        data: {
          clusterID: 'c1',
          clusterName: 'N',
          properties: {},
        },
      },
    }).render(<TagAcmHubDialog onClose={onClose} />);

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText(/Error adding ACM Hub tag/)).toBeInTheDocument();
  });

  it('shows cluster name in modal when shouldDisplayClusterName is true', () => {
    withState({
      modal: {
        data: {
          clusterID: 'c1',
          clusterName: 'Displayed Name',
          shouldDisplayClusterName: true,
          properties: {},
        },
      },
    }).render(<TagAcmHubDialog onClose={onClose} />);

    expect(screen.getByText('Displayed Name')).toBeInTheDocument();
  });
});
