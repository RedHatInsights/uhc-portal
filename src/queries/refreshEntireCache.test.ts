import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';

import { refreshClusterDetails } from './refreshEntireCache';

jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

describe('refreshClusterDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates cluster details and control plane log forwarder queries', () => {
    refreshClusterDetails();

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);

    const clusterDetailsPredicate = (queryClient.invalidateQueries as jest.Mock).mock.calls[0][0]
      .predicate;
    expect(
      clusterDetailsPredicate({ queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY] }),
    ).toBe(true);
    expect(
      clusterDetailsPredicate({
        queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, 'cluster-1'],
      }),
    ).toBe(false);

    const logForwardersPredicate = (queryClient.invalidateQueries as jest.Mock).mock.calls[1][0]
      .predicate;
    expect(
      logForwardersPredicate({
        queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, 'cluster-1'],
      }),
    ).toBe(true);
    expect(
      logForwardersPredicate({ queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY] }),
    ).toBe(false);
  });
});
