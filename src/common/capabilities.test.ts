import forOwn from 'lodash/forOwn';
import times from 'lodash/times';

import { ClusterFromSubscription } from '~/types/types';

import { SubscriptionCommonFieldsStatus } from '../types/accounts_mgmt.v1';

import {
  clusterCapabilities,
  hasCapabilityValue,
  hasSubscribedOcpMarketplaceCapability,
  haveCapabilities,
  organizationCapabilities,
} from './capabilities';
import { getRandomID } from './helpers';

const allCapabilities = {
  ...clusterCapabilities,
  ...organizationCapabilities,
};

const newOCPCluster = (): ClusterFromSubscription => {
  const clusterID = getRandomID();
  const subID = getRandomID();

  return {
    id: clusterID,
    subscription: {
      id: subID,
      kind: 'Subscription',
      status: SubscriptionCommonFieldsStatus.Active,
      cluster_id: clusterID,
      capabilities: [],
    },
  } as unknown as ClusterFromSubscription;
};

const newDisconnectedCluster = (): ClusterFromSubscription => {
  const cluster = newOCPCluster();
  return {
    ...cluster,
    subscription: {
      ...cluster.subscription,
      status: SubscriptionCommonFieldsStatus.Disconnected,
    },
  } as unknown as ClusterFromSubscription;
};

const newNonExistsOCPCluster = (): ClusterFromSubscription => {
  const cluster = newOCPCluster();
  return {
    ...cluster,
    id: '',
    subscription: { ...cluster.subscription, id: '' },
  } as unknown as ClusterFromSubscription;
};

const withCapabilities = (cluster: ClusterFromSubscription): ClusterFromSubscription => {
  forOwn(allCapabilities, (cap) => {
    cluster.subscription?.capabilities?.push({
      name: cap,
      value: 'true',
      inherited: false,
    });
  });
  return cluster;
};

const withFalsyCapabilities = (cluster: ClusterFromSubscription): ClusterFromSubscription => {
  forOwn(allCapabilities, (cap) => {
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

describe('hasCapabilityValue', () => {
  it('is true when the named capability value is "true"', () => {
    const capabilities = [
      { name: organizationCapabilities.HIBERNATE_CLUSTER, value: 'true', inherited: false },
    ];

    expect(
      hasCapabilityValue(capabilities, organizationCapabilities.HIBERNATE_CLUSTER),
    ).toBeTruthy();
  });

  it('is false when the named capability value is "false"', () => {
    const capabilities = [
      { name: organizationCapabilities.HIBERNATE_CLUSTER, value: 'false', inherited: false },
    ];

    expect(
      hasCapabilityValue(capabilities, organizationCapabilities.HIBERNATE_CLUSTER),
    ).toBeFalsy();
  });

  it('is false when the named capability is missing', () => {
    const capabilities = [
      { name: clusterCapabilities.SUBSCRIBED_OCP, value: 'true', inherited: false },
    ];

    expect(
      hasCapabilityValue(capabilities, organizationCapabilities.HIBERNATE_CLUSTER),
    ).toBeFalsy();
  });

  it('is false when capabilities is undefined', () => {
    expect(hasCapabilityValue(undefined, organizationCapabilities.HIBERNATE_CLUSTER)).toBeFalsy();
  });

  it('is always true for RELEASE_OCP_CLUSTERS regardless of the capabilities list', () => {
    expect(hasCapabilityValue(undefined, clusterCapabilities.RELEASE_OCP_CLUSTERS)).toBeTruthy();
    expect(hasCapabilityValue([], clusterCapabilities.RELEASE_OCP_CLUSTERS)).toBeTruthy();
    expect(
      hasCapabilityValue(
        [{ name: clusterCapabilities.RELEASE_OCP_CLUSTERS, value: 'false', inherited: false }],
        clusterCapabilities.RELEASE_OCP_CLUSTERS,
      ),
    ).toBeTruthy();
  });
});

describe('hasSubscribedOcpMarketplaceCapability', () => {
  it('is true when the capability value is "true" on an active, already-created subscription', () => {
    const cluster = withCapabilities(newOCPCluster());
    expect(hasSubscribedOcpMarketplaceCapability(cluster.subscription)).toBeTruthy();
  });

  it('is false when the capabilities list is empty', () => {
    const cluster = newOCPCluster();
    expect(hasSubscribedOcpMarketplaceCapability(cluster.subscription)).toBeFalsy();
  });

  it('is false when the capability value is not "true"', () => {
    const cluster = withFalsyCapabilities(newOCPCluster());
    expect(hasSubscribedOcpMarketplaceCapability(cluster.subscription)).toBeFalsy();
  });

  it('is false for a disconnected cluster, even if the capability value is "true"', () => {
    const cluster = withCapabilities(newDisconnectedCluster());
    expect(hasSubscribedOcpMarketplaceCapability(cluster.subscription)).toBeFalsy();
  });

  it('is false when the subscription does not exist yet, even if the capability value is "true"', () => {
    const cluster = withCapabilities(newNonExistsOCPCluster());
    expect(hasSubscribedOcpMarketplaceCapability(cluster.subscription)).toBeFalsy();
  });
});

const expectHaveCapabilitiesToBeTruthy = (clusters: ClusterFromSubscription[]) => {
  forOwn(allCapabilities, (cap) => {
    const results = haveCapabilities(clusters, cap);
    forOwn(results, (res) => {
      expect(res).toBeTruthy();
    });
  });
};

const expectHaveCapabilitiesToBeFalsy = (clusters: ClusterFromSubscription[]) => {
  forOwn(allCapabilities, (cap) => {
    const results = haveCapabilities(clusters, cap);
    forOwn(results, (res) => {
      if (cap === clusterCapabilities.RELEASE_OCP_CLUSTERS) {
        // this capability is always overridden to true, see hasCapabilityValue
        expect(res).toBeTruthy();
      } else {
        expect(res).toBeFalsy();
      }
    });
  });
};

describe('haveCapabilities', () => {
  it('finds capabilities that are present and "true" across all clusters', () => {
    const clusters = times(3, () => withCapabilities(newOCPCluster()));
    expectHaveCapabilitiesToBeTruthy(clusters);
  });

  it('does not find capabilities on an empty list, except the always-true RELEASE_OCP_CLUSTERS override', () => {
    const clusters = times(3, newOCPCluster);
    expectHaveCapabilitiesToBeFalsy(clusters);
  });

  it('does not find capabilities with invalid values, except the always-true RELEASE_OCP_CLUSTERS override', () => {
    const clusters = times(3, () => withFalsyCapabilities(newOCPCluster()));
    expectHaveCapabilitiesToBeFalsy(clusters);
  });

  it('never finds subscribed_ocp_marketplace for disconnected clusters', () => {
    const clusters = times(3, () => withCapabilities(newDisconnectedCluster()));
    const results = haveCapabilities(clusters, clusterCapabilities.SUBSCRIBED_OCP_MARKETPLACE);
    forOwn(results, (res) => {
      expect(res).toBeFalsy();
    });
  });

  it('never finds subscribed_ocp_marketplace for clusters whose subscription does not exist yet', () => {
    const clusters = times(3, () => withCapabilities(newNonExistsOCPCluster()));
    const results = haveCapabilities(clusters, clusterCapabilities.SUBSCRIBED_OCP_MARKETPLACE);
    forOwn(results, (res) => {
      expect(res).toBeFalsy();
    });
  });
});
