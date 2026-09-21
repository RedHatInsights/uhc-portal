import { queryClient } from '~/components/App/queryClient';
import { queryConstants } from '~/queries/queriesConstants';

import { refreshClusterDetails } from './refreshEntireCache';
import { OCP_LIFECYCLE_QUERY_KEY } from './useOCPLifeCycleStatus';

jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

describe('refreshClusterDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates cluster details, OCM role, control plane log forwarder, and OCP lifecycle queries', () => {
    refreshClusterDetails();

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(4);

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

    const ocmRolePredicate = (queryClient.invalidateQueries as jest.Mock).mock.calls[1][0]
      .predicate;
    expect(
      ocmRolePredicate({ queryKey: [queryConstants.FETCH_GET_OCM_ROLE, 'aws-account-1'] }),
    ).toBe(true);
    expect(ocmRolePredicate({ queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY] })).toBe(
      false,
    );

    const logForwardersPredicate = (queryClient.invalidateQueries as jest.Mock).mock.calls[2][0]
      .predicate;
    expect(
      logForwardersPredicate({
        queryKey: [queryConstants.FETCH_CLUSTER_CONTROL_PLANE_LOG_FORWARDERS, 'cluster-1'],
      }),
    ).toBe(true);
    expect(
      logForwardersPredicate({ queryKey: [queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY] }),
    ).toBe(false);

    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: [OCP_LIFECYCLE_QUERY_KEY],
    });
  });
});
