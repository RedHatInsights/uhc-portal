import { ClusterFromSubscription } from '~/types/types';

import { formatCluster } from './formatCluster';

const cluster: ClusterFromSubscription = {
  id: '123',
  name: 'Test Cluster',
  metrics: { upgrade: {} },
  subscription: {
    id: 'sub-123',
    display_name: 'Test Subscription',
    managed: true,
  },
} as Partial<ClusterFromSubscription> as ClusterFromSubscription;

describe('formatCluster', () => {
  it('should format cluster with subscription', () => {
    const formatted = formatCluster(cluster);
    expect(formatted).toMatchObject({
      id: '123',
      name: 'Test Cluster',
      subscription: {
        id: 'sub-123',
        display_name: 'Test Subscription',
      },
    });
  });

  it('should format cluster without subscription', () => {
    const { subscription, ...clusterWithoutSubscription } = cluster;
    const formatted = formatCluster(clusterWithoutSubscription);

    expect(formatted).toMatchObject({
      id: '123',
      name: 'Test Cluster',
    });
    expect(
      Object.values(formatted.subscription).every(
        (v) =>
          v === undefined ||
          v === false ||
          (typeof v === 'object' && v !== null && Object.values(v).every((sv) => sv === undefined)),
      ),
    ).toBe(true);
  });
});
