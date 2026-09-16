import forOwn from 'lodash/forOwn';
import times from 'lodash/times';

import { ClusterFromSubscription } from '~/types/types';

import { SubscriptionCommonFieldsStatus } from '../types/accounts_mgmt.v1';

import { getRandomID } from './helpers';
import {
  hasAllowOcp5Capability,
  hasCapability,
  haveCapabilities,
  subscriptionCapabilities,
} from './subscriptionCapabilities';

const { SUBSCRIBED_OCP_MARKETPLACE } = subscriptionCapabilities;

const newOCPCluster = () => {
  const clusterID = getRandomID();
  const subID = getRandomID();
  const cluster = {
    kind: 'Cluster',
    id: clusterID,
    subscription: {
      id: subID,
      kind: 'Subscription',
      status: SubscriptionCommonFieldsStatus.Active,
      cluster_id: clusterID,
      capabilities: [],
    },
  };

  return cluster;
};

const newDisconnectedCluster = () => {
  const cluster = newOCPCluster();
  cluster.subscription.status = SubscriptionCommonFieldsStatus.Disconnected;
  return cluster;
};

const newNonExistsOCPCluster = () => {
  const cluster = newOCPCluster();
  cluster.id = '';
  cluster.subscription.id = '';
  return cluster;
};

const withCapabilites = (cluster: ClusterFromSubscription) => {
  forOwn(subscriptionCapabilities, (cap) => {
    cluster.subscription?.capabilities?.push({
      name: cap,
      value: 'true',
      inherited: false,
    });
  });
  return cluster;
};

const withFalsyCapabilites = (cluster: ClusterFromSubscription) => {
  forOwn(subscriptionCapabilities, (cap) => {
    cluster.subscription?.capabilities?.push(
      {
        name: cap,
        value: 'false',
        inherited: false,
      },
      {
        name: cap,
        value: '',
        inherited: false,
      },
      {
        name: 'foobar',
        value: 'true',
        inherited: false,
      },
    );
  });

  return cluster;
};

const expectHasCapabilityToBeTruthy = (cluster: ClusterFromSubscription) => {
  forOwn(subscriptionCapabilities, (cap) => {
    expect(hasCapability(cluster.subscription, cap)).toBeTruthy();
  });
};

const expectHasCapabilityToBeFalsy = (cluster: ClusterFromSubscription) => {
  forOwn(subscriptionCapabilities, (cap) => {
    if (cap === subscriptionCapabilities.RELEASE_OCP_CLUSTERS) {
      // for now, this is overridden always being true
      expect(hasCapability(cluster.subscription, cap)).toBeTruthy();
    } else {
      expect(hasCapability(cluster.subscription, cap)).toBeFalsy();
    }
  });
};

describe('hasCapability', () => {
  it('it should have capability', () => {
    const cluster = withCapabilites(newOCPCluster() as any as ClusterFromSubscription);
    expectHasCapabilityToBeTruthy(cluster);
  });

  it('it should have no capability of empty list', () => {
    const cluster = newOCPCluster() as any as ClusterFromSubscription;
    expectHasCapabilityToBeFalsy(cluster);
  });

  it('it should have no capability of invalid values', () => {
    const cluster = withFalsyCapabilites(newOCPCluster() as any as ClusterFromSubscription);
    expectHasCapabilityToBeFalsy(cluster);
  });

  it('it should never have subscribed_ocp_marketplace for disconnected cluster', () => {
    const cluster = withCapabilites(newDisconnectedCluster() as any as ClusterFromSubscription);
    expect(hasCapability(cluster.subscription, SUBSCRIBED_OCP_MARKETPLACE)).toBeFalsy();
  });

  it('it should never have subscribed_ocp_marketplace for cluster not already exists', () => {
    const cluster = withCapabilites(newNonExistsOCPCluster() as any as ClusterFromSubscription);
    expect(hasCapability(cluster.subscription, SUBSCRIBED_OCP_MARKETPLACE)).toBeFalsy();
  });
});

const expectHaveCapabilitiesToBeTruthy = (clusters: ClusterFromSubscription[]) => {
  forOwn(subscriptionCapabilities, (cap) => {
    const results = haveCapabilities(clusters, cap);
    forOwn(results, (res) => {
      expect(res).toBeTruthy();
    });
  });
};

const expectHaveCapabilitiesToBeFalsy = (clusters: ClusterFromSubscription[]) => {
  forOwn(subscriptionCapabilities, (cap) => {
    const results = haveCapabilities(clusters, cap);
    forOwn(results, (res) => {
      if (cap === subscriptionCapabilities.RELEASE_OCP_CLUSTERS) {
        // it alwasy has this cap
        expect(res).toBeTruthy();
      } else {
        expect(res).toBeFalsy();
      }
    });
  });
};

describe('haveCapabilities', () => {
  it('it should have capabilities', () => {
    const clusters = times(3, () =>
      withCapabilites(newOCPCluster() as any as ClusterFromSubscription),
    );
    expectHaveCapabilitiesToBeTruthy(clusters);
  });

  it('it should have no capabilities of empty list', () => {
    const clusters = times(3, newOCPCluster);
    expectHaveCapabilitiesToBeFalsy(clusters as any as ClusterFromSubscription[]);
  });

  it('it should have no capabilities of invalid values', () => {
    const clusters = times(3, () =>
      withFalsyCapabilites(newOCPCluster() as any as ClusterFromSubscription),
    );
    expectHaveCapabilitiesToBeFalsy(clusters);
  });

  it('it should never have subscribed_ocp_marketplace for disconnected cluster', () => {
    const clusters = times(3, () =>
      withCapabilites(newDisconnectedCluster() as any as ClusterFromSubscription),
    );
    const results = haveCapabilities(clusters, SUBSCRIBED_OCP_MARKETPLACE);
    forOwn(results, (res) => {
      expect(res).toBeFalsy();
    });
  });

  it('it should never have subscribed_ocp_marketplace for cluster not already exists', () => {
    const clusters = times(3, () =>
      withCapabilites(newNonExistsOCPCluster() as any as ClusterFromSubscription),
    );
    const results = haveCapabilities(clusters, SUBSCRIBED_OCP_MARKETPLACE);
    forOwn(results, (res) => {
      expect(res).toBeFalsy();
    });
  });
});

describe('hasAllowOcp5Capability', () => {
  it('is true when the capabilities array contains rosa_osd_allow_ocp_5 set to "true"', () => {
    const capabilities = [
      { name: subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5, value: 'true', inherited: false },
    ];

    expect(hasAllowOcp5Capability(capabilities)).toBeTruthy();
  });

  it('is false when the capabilities array contains rosa_osd_allow_ocp_5 set to "false"', () => {
    const capabilities = [
      { name: subscriptionCapabilities.ROSA_OSD_ALLOW_OCP_5, value: 'false', inherited: false },
    ];

    expect(hasAllowOcp5Capability(capabilities)).toBeFalsy();
  });

  it('is false when the capabilities array does not contain rosa_osd_allow_ocp_5', () => {
    const capabilities = [
      { name: subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS, value: 'true', inherited: false },
    ];

    expect(hasAllowOcp5Capability(capabilities)).toBeFalsy();
  });

  it('is false when capabilities is undefined', () => {
    expect(hasAllowOcp5Capability(undefined)).toBeFalsy();
  });
});
